import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked, Renderer } from "marked";
import {
  createCssVariablesTheme,
  createHighlighter,
  isSpecialLang,
} from "shiki";
import { displayDate, parsePublishedAt } from "./dates";
import { rewriteArticleScripts } from "./rewrite-article-scripts";

const paperTheme = createCssVariablesTheme({
  name: "paper",
  variablePrefix: "--shiki-",
});

const highlighter = await createHighlighter({
  themes: [paperTheme],
  langs: [
    "apache",
    "bash",
    "c",
    "console",
    "csharp",
    "css",
    "html",
    "javascript",
    "json",
    "php",
    "plaintext",
    "python",
    "ruby",
    "scss",
    "shellscript",
    "shellsession",
    "typescript",
    "xml",
  ],
});

const langAlias: Record<string, string> = {
  apacheconf: "apache",
  js: "javascript",
  shell: "bash",
  "shell-session": "shellsession",
  ts: "typescript",
};

function normalizeLang(lang?: string): string {
  if (!lang) return "plaintext";
  return langAlias[lang.toLowerCase()] ?? lang.toLowerCase();
}

function highlightCode(code: string, lang?: string): string {
  const language = normalizeLang(lang);
  const loaded = highlighter.getLoadedLanguages();
  const resolved =
    language === "plaintext" ||
    isSpecialLang(language) ||
    loaded.includes(language)
      ? language
      : "plaintext";
  return highlighter.codeToHtml(code.replace(/^\n+|\n+$/g, ""), {
    lang: resolved,
    theme: "paper",
  });
}

export type Post = {
  title: string;
  date: string;
  publishedAt: Date;
  description: string | null;
  permalink: string;
  slug: string;
  labels: string[];
  language: "zh-CN";
  translationStatus: "original" | "translated";
  source: string;
  html: string;
  shareImage: string | null;
};

export const LOST_IMAGE_TEXT = "图片已失联在历史的海洋中...";

function findRepoRoot(): string {
  const starts = [dirname(fileURLToPath(import.meta.url)), process.cwd()];
  for (const start of starts) {
    let dir = start;
    for (let i = 0; i < 8; i += 1) {
      if (existsSync(join(dir, "_posts"))) return dir;
      const parent = join(dir, "..");
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error("找不到 _posts 目录");
}

const repoRoot = findRepoRoot();
const postsDir = join(repoRoot, "_posts");
const imagesDir = join(repoRoot, "assets", "images");

function scalar(frontMatter: string, key: string): string | null {
  const value = frontMatter
    .match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]
    ?.trim();
  return value?.replace(/^(["'])(.*)\1$/, "$2") ?? null;
}

function parseLabels(value: string | null): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((label) => label.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function slugFromPermalink(permalink: string): string {
  return permalink.replace(/^\/posts\/|\/$/g, "");
}

function prepareMarkdown(body: string): string {
  return body
    .replace(/\{\{\s*site\.static_url\s*\}\}/g, "/assets/images")
    .replace(/(\.(?:png|jpe?g|gif|webp|svg|bmp))![^)\s]*/gi, "$1")
    .replace(
      /\{%\s*highlight\s+([a-zA-Z0-9_+-]+)(?:\s+[^%]*)?\s*%\}/g,
      "\n```$1",
    )
    .replace(/\{%\s*endhighlight\s*%\}/g, "```\n");
}

function stripImageModifier(src: string): string {
  return src.replace(/(\.(?:png|jpe?g|gif|webp|svg|bmp))![^/\s?#]*/i, "$1");
}

function localImagePath(src: string): string | null {
  let href = src.trim();
  try {
    href = decodeURI(href);
  } catch {
    // keep the raw path when it is not a valid escape sequence
  }
  href = stripImageModifier(href.split(/[?#]/, 1)[0] ?? href);
  if (!href.startsWith("/assets/images/")) return null;
  return join(imagesDir, href.slice("/assets/images/".length));
}

function localImageMissing(src: string): boolean {
  const filePath = localImagePath(src);
  return Boolean(filePath && !existsSync(filePath));
}

function lostImagePlaceholder(alt: string): string {
  const safeAlt = alt.trim();
  const caption =
    safeAlt && !/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(safeAlt)
      ? `<figcaption>${escapeHtml(safeAlt)}</figcaption>`
      : "";
  return `<figure class="lost-image"><div class="lost-image-frame" role="img" aria-label="${escapeHtml(LOST_IMAGE_TEXT)}"><span>${escapeHtml(LOST_IMAGE_TEXT)}</span></div>${caption}</figure>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const renderer = new Renderer();
const renderImage = renderer.image.bind(renderer);

renderer.image = (token) => {
  const href = stripImageModifier(token.href);
  const alt = token.text.trim();
  if (localImageMissing(href)) {
    return lostImagePlaceholder(alt);
  }
  const image = renderImage({ ...token, href });
  if (!alt || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(alt)) {
    return image;
  }
  return `<figure>${image}<figcaption>${escapeHtml(alt)}</figcaption></figure>`;
};

renderer.code = ({ text, lang }) => `${highlightCode(text, lang)}\n`;

function wrapTables(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) =>
    table.includes("table-wrap")
      ? table
      : `<div class="table-wrap">${table}</div>`,
  );
}

function rewriteRawImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src) return tag;
    const href = stripImageModifier(src);
    if (localImageMissing(href)) {
      const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
      return lostImagePlaceholder(alt);
    }
    return href === src ? tag : tag.replace(src, href);
  });
}

function parsePost(filename: string): Post {
  const sourcePath = join(postsDir, filename);
  const source = readFileSync(sourcePath, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${filename} 缺少 front matter`);
  }

  const frontMatter = match[1];
  const title = scalar(frontMatter, "title");
  const date = scalar(frontMatter, "date");
  const permalink = scalar(frontMatter, "permalink");
  if (!title || !date || !permalink) {
    throw new Error(`${filename} 缺少 title、date 或 permalink`);
  }
  if (!/^\/posts\/.+\/$/.test(permalink)) {
    throw new Error(`${filename} 的 permalink 不符合历史格式：${permalink}`);
  }

  const body = prepareMarkdown(source.slice(match[0].length));
  const html = rewriteArticleScripts(
    rewriteRawImages(
      wrapTables(marked.parse(body, { async: false, renderer }) as string),
    ),
  );
  const shareImage =
    html.match(/<img\b[^>]*\bsrc=["'](\/assets\/images\/[^"']+)["']/i)?.[1] ??
    null;
  return {
    title,
    date: displayDate(date),
    publishedAt: parsePublishedAt(date),
    description: scalar(frontMatter, "description"),
    permalink,
    slug: slugFromPermalink(permalink),
    labels: parseLabels(scalar(frontMatter, "labels")),
    language: "zh-CN",
    translationStatus: "original",
    source: `_posts/${filename}`,
    html,
    shareImage,
  };
}

let cache: Post[] | undefined;

export function listPosts(): Post[] {
  if (!cache) {
    cache = readdirSync(postsDir)
      .filter((filename) => filename.endsWith(".md"))
      .map(parsePost)
      .sort(
        (a, b) =>
          b.publishedAt.getTime() - a.publishedAt.getTime() ||
          b.slug.localeCompare(a.slug),
      );
  }
  return cache;
}

export function getPost(slug: string): Post | undefined {
  return listPosts().find((post) => post.slug === slug);
}

export function groupPostsByYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const bucket = groups.get(year) ?? [];
    bucket.push(post);
    groups.set(year, bucket);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
}
