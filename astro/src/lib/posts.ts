import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { marked, Renderer } from "marked";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("c", c);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("shell-session", bash);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);

function normalizeLang(lang?: string): string | undefined {
  if (!lang) return undefined;
  const name = lang.toLowerCase();
  if (name === "shell-session" || name === "console") return "bash";
  return name;
}

function highlightCode(code: string, lang?: string): string {
  const language = normalizeLang(lang);
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language }).value;
  }
  return escapeHtml(code);
}

export type Post = {
  title: string;
  date: string;
  description: string | null;
  permalink: string;
  slug: string;
  labels: string[];
  source: string;
  html: string;
};

function findPostsDir(): string {
  const candidates = [
    resolve(process.cwd(), "..", "_posts"),
    resolve(process.cwd(), "_posts"),
  ];
  const found = candidates.find((dir) => existsSync(dir));
  if (!found) {
    throw new Error(`找不到 _posts 目录（cwd=${process.cwd()}）`);
  }
  return found;
}

const postsDir = findPostsDir();

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
    .map((label) => label.trim())
    .filter(Boolean);
}

function displayDate(value: string): string {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? value;
}

function slugFromPermalink(permalink: string): string {
  return permalink.replace(/^\/posts\/|\/$/g, "");
}

function prepareMarkdown(body: string): string {
  return body
    .replace(/\{\{\s*site\.static_url\s*\}\}/g, "/assets/images")
    .replace(
      /\{%\s*highlight\s+([a-zA-Z0-9_+-]+)(?:\s+[^%]*)?\s*%\}/g,
      "\n```$1\n",
    )
    .replace(/\{%\s*endhighlight\s*%\}/g, "\n```\n");
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
  const image = renderImage(token);
  const alt = token.text.trim();
  if (!alt || /\.(png|jpe?g|gif|webp|svg)$/i.test(alt)) {
    return image;
  }
  return `<figure>${image}<figcaption>${escapeHtml(alt)}</figcaption></figure>`;
};

renderer.code = ({ text, lang }) => {
  const language = normalizeLang(lang);
  const highlighted = highlightCode(text, language);
  const className = language ? `hljs language-${language}` : "hljs";
  return `<pre><code class="${className}">${highlighted}</code></pre>\n`;
};

function wrapTables(html: string): string {
  return html.replace(/<table\b[\s\S]*?<\/table>/gi, (table) =>
    table.includes("table-wrap")
      ? table
      : `<div class="table-wrap">${table}</div>`,
  );
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

  const body = prepareMarkdown(source.slice(match[0].length));
  return {
    title,
    date: displayDate(date),
    description: scalar(frontMatter, "description"),
    permalink,
    slug: slugFromPermalink(permalink),
    labels: parseLabels(scalar(frontMatter, "labels")),
    source: `_posts/${filename}`,
    html: wrapTables(marked.parse(body, { async: false, renderer }) as string),
  };
}

let cache: Post[] | undefined;

export function listPosts(): Post[] {
  if (!cache) {
    cache = readdirSync(postsDir)
      .filter((filename) => filename.endsWith(".md"))
      .map(parsePost)
      .sort(
        (a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug),
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
