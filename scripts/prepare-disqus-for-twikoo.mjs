import { gunzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function usage() {
  console.error(
    "用法：node scripts/prepare-disqus-for-twikoo.mjs <Disqus XML 或 XML.GZ> <输出 XML> [--public-existing-only] [--limit-one]",
  );
  process.exitCode = 1;
}

function decodeXmlText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function escapeXmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function readRedirects() {
  const redirects = new Map();
  const source = readFileSync(
    join(repoRoot, "astro/public/_redirects"),
    "utf8",
  );
  for (const line of source.split(/\r?\n/)) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (from && to && status === "301") redirects.set(from, to);
  }
  return redirects;
}

function normalizePath(link, origin, redirects) {
  const url = new URL(decodeXmlText(link.trim()), origin);
  let path = url.pathname;
  if (path.startsWith("/posts/") && !path.endsWith("/")) path += "/";
  return redirects.get(path) ?? path;
}

function readXml(inputPath) {
  const source = readFileSync(inputPath);
  const gzipped =
    inputPath.endsWith(".gz") || (source[0] === 0x1f && source[1] === 0x8b);
  return (gzipped ? gunzipSync(source) : source).toString("utf8");
}

const [inputPath, outputPath, ...options] = process.argv.slice(2);
const publicExistingOnly = options.includes("--public-existing-only");
const limitOne = options.includes("--limit-one");
const unknownOptions = options.filter(
  (option) =>
    option !== "--public-existing-only" && option !== "--limit-one",
);
if (
  !inputPath ||
  !outputPath ||
  unknownOptions.length > 0 ||
  (limitOne && !publicExistingOnly)
) {
  usage();
} else {
  const contract = JSON.parse(
    readFileSync(join(repoRoot, "migration-contract.json"), "utf8"),
  );
  const retainedPaths = new Set([
    ...contract.posts.map((post) => post.url),
    "/about/",
    "/posts/sailingwood-recruit/",
  ]);
  const existingPaths = new Set([
    ...contract.posts.map((post) => post.url),
    "/about/",
  ]);
  const redirects = readRedirects();
  const xml = readXml(inputPath);
  const paths = [];
  const threadPaths = new Map();
  const unknownPaths = new Set();
  const firstPostIndex = xml.search(/\n<post\b/);
  if (firstPostIndex < 0) {
    throw new Error("导出文件中没有找到 Disqus post 节点");
  }
  const activeThreadIds = new Set(
    [
      ...xml.slice(firstPostIndex).matchAll(/<thread dsq:id="([^"]+)"\s*\/>/g),
    ].map((match) => match[1]),
  );

  const threadSection = xml.slice(0, firstPostIndex);
  const preparedThreads = threadSection.replace(
    /<thread\b[^>]*>[\s\S]*?<\/thread>/g,
    (thread) => {
      const threadId = thread.match(/^<thread dsq:id="([^"]+)">/)?.[1];
      if (!threadId || !activeThreadIds.has(threadId)) return thread;

      const link = thread.match(/<link>([\s\S]*?)<\/link>/)?.[1];
      const idPattern = /<id\s*\/>|<id>[\s\S]*?<\/id>/;
      if (!link || !idPattern.test(thread)) {
        throw new Error("Disqus thread 缺少 link 或 id，已停止转换");
      }

      const path = normalizePath(link, contract.origin, redirects);
      paths.push(path);
      threadPaths.set(threadId, path);
      if (!retainedPaths.has(path)) unknownPaths.add(path);
      return thread.replace(idPattern, `<id>${escapeXmlText(path)}</id>`);
    },
  );
  let postSection = xml.slice(firstPostIndex);
  let excludedSpam = 0;
  let excludedDeleted = 0;
  let excludedMissingArticle = 0;
  let includedPosts = 0;
  const includedPaths = new Set();
  if (publicExistingOnly) {
    const removedPostIds = new Set();
    const postBlocks = [
      ...postSection.matchAll(/<post\b[^>]*>[\s\S]*?<\/post>/g),
    ];
    for (const match of postBlocks) {
      const post = match[0];
      const postId = post.match(/^<post dsq:id="([^"]+)">/)?.[1];
      const threadId = post.match(/<thread dsq:id="([^"]+)"\s*\/>/)?.[1];
      const path = threadPaths.get(threadId);
      const isSpam = /<isSpam>true<\/isSpam>/.test(post);
      const isDeleted = /<isDeleted>true<\/isDeleted>/.test(post);
      const isMissingArticle = !existingPaths.has(path);
      if (isSpam || isDeleted || isMissingArticle) {
        if (!postId || !threadId || !path) {
          throw new Error("待排除的 Disqus post 缺少 id、thread 或路径");
        }
        removedPostIds.add(postId);
        if (isSpam) excludedSpam += 1;
        if (isDeleted) excludedDeleted += 1;
        if (isMissingArticle) excludedMissingArticle += 1;
      }
    }
    const brokenReplies = postBlocks.filter((match) => {
      const post = match[0];
      const postId = post.match(/^<post dsq:id="([^"]+)">/)?.[1];
      const parentId = post.match(/<parent dsq:id="([^"]+)"\s*\/>/)?.[1];
      return !removedPostIds.has(postId) && removedPostIds.has(parentId);
    });
    if (brokenReplies.length > 0) {
      throw new Error(
        `筛选后有 ${brokenReplies.length} 条回复指向已排除评论，已停止写入`,
      );
    }
    let limitedPostId;
    if (limitOne) {
      limitedPostId = postBlocks
        .map((match) => match[0])
        .find((post) => {
          const postId = post.match(/^<post dsq:id="([^"]+)">/)?.[1];
          const parentId = post.match(/<parent dsq:id="([^"]+)"\s*\/>/)?.[1];
          return postId && !removedPostIds.has(postId) && !parentId;
        })
        ?.match(/^<post dsq:id="([^"]+)">/)?.[1];
      if (!limitedPostId) {
        throw new Error("没有找到可用于单条导入测试的顶层评论");
      }
    }
    postSection = postSection.replace(
      /\n?<post\b[^>]*>[\s\S]*?<\/post>/g,
      (post) => {
        const postId = post.match(/<post dsq:id="([^"]+)">/)?.[1];
        if (removedPostIds.has(postId)) return "";
        if (limitedPostId && postId !== limitedPostId) return "";
        const threadId = post.match(/<thread dsq:id="([^"]+)"\s*\/>/)?.[1];
        includedPaths.add(threadPaths.get(threadId));
        includedPosts += 1;
        return post;
      },
    );
  }
  const prepared = preparedThreads + postSection;

  if (paths.length === 0) {
    throw new Error("没有在导出文件中找到 Disqus thread");
  }
  if (unknownPaths.size > 0) {
    throw new Error(
      `以下评论路径不在迁移契约中，已停止写入：${[...unknownPaths].join(", ")}`,
    );
  }

  writeFileSync(outputPath, prepared, { flag: "wx" });
  const uniquePaths = new Set(paths);
  console.log(`Twikoo 导入文件已生成：${outputPath}`);
  console.log(`有评论的 Disqus threads：${paths.length}`);
  console.log(`评论路径：${uniquePaths.size}`);
  console.log(
    `合并到已有路径的重复 threads：${paths.length - uniquePaths.size}`,
  );
  if (publicExistingOnly) {
    console.log(`实际导入评论：${includedPosts}`);
    console.log(`实际导入路径：${includedPaths.size}`);
    console.log(`排除 spam：${excludedSpam}`);
    console.log(`排除 deleted：${excludedDeleted}`);
    console.log(`排除已删除文章评论：${excludedMissingArticle}`);
  } else {
    console.log("保留但当前没有文章页的路径：/posts/sailingwood-recruit/");
  }
}
