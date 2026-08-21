import type { APIRoute } from "astro";
import { listPosts } from "../lib/posts";
import { PAGE_SIZE, fallbackSite } from "../lib/site";
import { absoluteUrl } from "../lib/text";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? fallbackSite;
  const posts = listPosts();
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paths = [
    "/",
    "/about/",
    "/all-articles/",
    ...Array.from({ length: totalPages - 1 }, (_, index) => `/${index + 2}/`),
    ...posts.map((post) => post.permalink),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => `  <url><loc>${absoluteUrl(path, origin)}</loc></url>`)
  .join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
