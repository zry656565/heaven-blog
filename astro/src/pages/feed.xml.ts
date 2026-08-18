import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { listPosts } from "../lib/posts";

const siteTitle = "咀嚼之味";
const siteDescription =
  "咀嚼之味是我分享我对编程与生活的见解之地。我喜欢做一些安静的事，比如看书、看电影、听音乐、散步以及旅行。";

function excerpt(html: string, fallback: string | null): string {
  const source = fallback?.trim() || html;
  const text = source
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`]{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 280);
}

export const GET: APIRoute = (context) =>
  rss({
    title: siteTitle,
    description: siteDescription,
    site: context.site ?? "https://heaven-blog-next.pages.dev",
    trailingSlash: true,
    customData: "<language>zh-CN</language>",
    items: listPosts()
      .slice(0, 10)
      .map((post) => ({
        title: post.title,
        description: excerpt(post.html, post.description),
        pubDate: new Date(`${post.date}T00:00:00+08:00`),
        link: post.permalink,
        categories: post.labels,
      })),
  });
