import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contractPath = join(root, "migration-contract.json");
const live = process.argv.includes("--live");
const printContract = process.argv.includes("--print-contract");
const liveOrigin = process.env.VERIFY_ORIGIN;

function matchTag(html, pattern) {
  return html.match(pattern)?.groups?.value?.trim() || null;
}

function routeType(path) {
  if (path === "/feed.xml") return "feed";
  if (path === "/robots.txt") return "robots";
  if (path === "/sitemap.xml") return "sitemap";
  if (/^\/[2-8]\/$/.test(path)) return "pagination";
  if (path === "/posts/shadowsocks-with-digitalocean/") return "legacy-compat";
  if (path.startsWith("/posts/")) return "post";
  return "page";
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function inspectRoute(origin, path) {
  const response = await fetchWithRetry(new URL(path, origin), { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const html = contentType.includes("text/html") ? await response.text() : "";
  return {
    path,
    type: routeType(path),
    status: response.status,
    title: html ? matchTag(html, /<title[^>]*>(?<value>[\s\S]*?)<\/title>/i) : null,
    description: html ? matchTag(html, /<meta[^>]+name=["']description["'][^>]+content=["'](?<value>[^"']*)["'][^>]*>/i) : null,
    canonical: html ? matchTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["'](?<value>[^"']+)["'][^>]*>/i) : null,
    html,
  };
}

function readPost(file) {
  const source = readFileSync(file, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${relative(root, file)} 缺少 front matter`);

  const frontMatter = match[1];
  const scalar = (key) => {
    const value = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
    return value?.replace(/^(["'])(.*)\1$/, "$2");
  };
  const body = source.slice(match[0].length).replace(/\r\n/g, "\n");
  const images = new Set();

  for (const imageMatch of body.matchAll(/\{\{\s*site\.static_url\s*\}\}\/([^\s)'"<>]+)/g)) {
    images.add(`/assets/images/${imageMatch[1].replace(/![^/]+$/, "")}`);
  }
  for (const imageMatch of body.matchAll(/(?:src=["']|\]\()(?<path>\/assets\/images\/[^\s)'"<>]+)/g)) {
    images.add(imageMatch.groups.path.replace(/![^/]+$/, ""));
  }

  const risks = [];
  if (/\{%\s*highlight\b/.test(body)) risks.push("liquid-highlight");
  if (/\{\{\s*site\./.test(body)) risks.push("liquid-variable");
  if (/<(?:img|table|details|video|audio|object|embed)\b/i.test(body)) risks.push("raw-html");
  if (/<script\b/i.test(body)) risks.push("inline-script");
  if (/<iframe\b/i.test(body)) risks.push("iframe");
  if (/\.(?:png|jpe?g|gif|webp)!\w+/i.test(body)) risks.push("legacy-image-modifier");

  return {
    source: relative(root, file),
    title: scalar("title"),
    url: scalar("permalink"),
    bodySha256: createHash("sha256").update(body).digest("hex"),
    images: [...images].sort(),
    risks,
  };
}

function currentPosts() {
  return readdirSync(join(root, "_posts"))
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => readPost(join(root, "_posts", name)));
}

async function captureContract() {
  const response = await fetchWithRetry("https://jerryzou.com/sitemap.xml");
  if (!response.ok) throw new Error(`读取现网 sitemap 失败：HTTP ${response.status}`);
  const sitemap = await response.text();
  const sitemapRoutes = [...sitemap.matchAll(/<loc>https:\/\/jerryzou\.com(?<path>[^<]*)<\/loc>/g)]
    .map((match) => match.groups.path || "/")
    .sort();
  const paths = [...new Set([...sitemapRoutes, "/feed.xml", "/robots.txt", "/sitemap.xml"])].sort();
  const routes = [];
  const queue = [...paths];
  async function worker() {
    while (queue.length) {
      const route = await inspectRoute("https://jerryzou.com", queue.shift());
      delete route.html;
      routes.push(route);
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  routes.sort((a, b) => a.path.localeCompare(b.path));

  return {
    version: 1,
    capturedAt: "2026-08-17",
    origin: "https://jerryzou.com",
    posts: currentPosts(),
    routes,
    knownBrokenInternalLinks: [
      { from: "/posts/paperFormat/", to: "/www.pdf-express.org" },
    ],
  };
}

function validateContract(contract) {
  const errors = [];
  const posts = currentPosts();
  const expectedBySource = new Map(contract.posts.map((post) => [post.source, post]));

  if (posts.length !== contract.posts.length) {
    errors.push(`文章数变化：契约 ${contract.posts.length}，当前 ${posts.length}`);
  }

  const urls = new Set();
  for (const post of posts) {
    const expected = expectedBySource.get(post.source);
    if (!expected) {
      errors.push(`契约缺少文章：${post.source}`);
      continue;
    }
    if (!post.title || !post.url) errors.push(`${post.source} 缺少 title 或 permalink`);
    if (!post.url?.startsWith("/posts/") || !post.url?.endsWith("/")) {
      errors.push(`${post.source} 的 permalink 不符合历史格式：${post.url}`);
    }
    if (urls.has(post.url)) errors.push(`重复 permalink：${post.url}`);
    urls.add(post.url);

    for (const field of ["title", "url", "bodySha256"]) {
      if (post[field] !== expected[field]) errors.push(`${post.source} 的 ${field} 已偏离迁移契约`);
    }
    if (JSON.stringify(post.images) !== JSON.stringify(expected.images)) {
      errors.push(`${post.source} 的图片依赖已偏离迁移契约`);
    }
  }

  for (const expected of contract.posts) {
    for (const image of expected.images) {
      if (!existsSync(join(root, image.slice(1)))) {
        // 历史图片可能已只存在于线上；记录但不阻断本地基线。
        continue;
      }
    }
    if (!contract.routes.some((route) => route.path === expected.url)) errors.push(`路由契约缺少文章 URL：${expected.url}`);
  }

  for (const required of ["/", "/about/", "/all-articles/", "/feed.xml", "/robots.txt", "/sitemap.xml"]) {
    if (!contract.routes.some((route) => route.path === required)) errors.push(`路由契约缺少：${required}`);
  }

  return errors;
}

async function checkLive(contract) {
  const failures = [];
  const htmlBodies = [];
  const queue = [...contract.routes];
  const origin = liveOrigin || contract.origin;

  async function worker() {
    while (queue.length) {
      const expected = queue.shift();
      const actual = await inspectRoute(origin, expected.path);
      if (actual.status !== expected.status) {
        failures.push(`${expected.path} 返回 HTTP ${actual.status}，基线为 ${expected.status}`);
        continue;
      }
      for (const field of ["title", "description", "canonical"]) {
        if (actual[field] !== expected[field]) failures.push(`${expected.path} 的 ${field} 已偏离基线`);
      }
      if (actual.html) {
        htmlBodies.push({ path: expected.path, html: actual.html });
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));

  const knownRoutes = new Set(contract.routes.map((route) => route.path));
  const knownBroken = new Set((contract.knownBrokenInternalLinks || []).map(({ from, to }) => `${from}\n${to}`));
  for (const { path, html } of htmlBodies) {
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["'](?<href>[^"']+)["']/gi)) {
      const href = match.groups.href;
      if (/^(?:mailto:|tel:|javascript:|#)/i.test(href)) continue;
      const url = new URL(href, origin);
      if (url.origin !== origin) continue;
      const normalized = url.pathname.endsWith("/") || basename(url.pathname).includes(".")
        ? url.pathname
        : `${url.pathname}/`;
      if (!knownRoutes.has(normalized) && !normalized.startsWith("/assets/") && !knownBroken.has(`${path}\n${normalized}`)) {
        failures.push(`${path} 包含未登记的内部链接：${normalized}`);
      }
    }
  }

  return failures;
}

if (printContract) {
  process.stdout.write(`${JSON.stringify(await captureContract(), null, 2)}\n`);
  process.exit(0);
}

if (!existsSync(contractPath)) {
  console.error("缺少 migration-contract.json；先运行 --print-contract 生成并审阅基线。");
  process.exit(1);
}

const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const errors = validateContract(contract);
if (live) errors.push(...await checkLive(contract));

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`PASS：${contract.posts.length} 篇文章，${contract.routes.length} 条历史路由${live ? "，页面元数据、状态与内部链接" : ""}。`);
