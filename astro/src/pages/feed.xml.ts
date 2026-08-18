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

function rfc822(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return `${date} 00:00:00 +0800`;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
  const monthName = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][month - 1];
  return `${weekday}, ${String(day).padStart(2, "0")} ${monthName} ${year} 00:00:00 +0800`;
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
