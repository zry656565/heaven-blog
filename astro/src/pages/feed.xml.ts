import type { APIRoute } from "astro";
import { listPosts } from "../lib/posts";

const siteTitle = "咀嚼之味";
const siteDescription =
  "咀嚼之味是我分享我对编程与生活的见解之地。我喜欢做一些安静的事，比如看书、看电影、听音乐、散步以及旅行。";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function excerpt(html: string, fallback: string | null): string {
  if (fallback?.trim()) return fallback.trim();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 280);
}

function rfc822(date: string): string {
  return new Date(`${date}T00:00:00+08:00`)
    .toUTCString()
    .replace("GMT", "+0000");
}

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://heaven-blog-next.pages.dev")).origin;
  const items = listPosts()
    .slice(0, 10)
    .map((post) => {
      const url = `${origin}${post.permalink}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(excerpt(post.html, post.description))}</description>
      <pubDate>${rfc822(post.date)}</pubDate>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${origin}/</link>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
    <language>zh-CN</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
