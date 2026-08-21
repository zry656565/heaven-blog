import type { APIRoute } from "astro";
import { fallbackSite } from "../lib/site";
import { absoluteUrl } from "../lib/text";

export const GET: APIRoute = ({ site }) => {
  const body = `Sitemap: ${absoluteUrl("/sitemap.xml", site ?? fallbackSite)}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
