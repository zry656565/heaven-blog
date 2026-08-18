import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { marked } from "marked";

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
    html: marked.parse(body, { async: false }) as string,
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
