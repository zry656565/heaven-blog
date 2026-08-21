import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { listPosts } from "../lib/posts";
import { fallbackSite, siteDescription, siteTitle } from "../lib/site";
import { plainText } from "../lib/text";

function excerpt(html: string, fallback: string | null): string {
  const source = fallback?.trim() || html;
  const text = plainText(
    source
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
  );
  return text.slice(0, 280);
}

export const GET: APIRoute = (context) =>
  rss({
    title: siteTitle,
    description: siteDescription,
    site: context.site ?? fallbackSite,
    trailingSlash: true,
    customData: "<language>zh-CN</language>",
    items: listPosts()
      .slice(0, 10)
      .map((post) => ({
        title: post.title,
        description: excerpt(post.html, post.description),
        pubDate: post.publishedAt,
        link: post.permalink,
        categories: post.labels,
      })),
  });
