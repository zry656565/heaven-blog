import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTHS = [400, 800, 1200] as const;
export const ARTICLE_SIZES = "(max-width: 600px) calc(100vw - 1.5rem), 42rem";
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp"]);

export type ImageInfo = {
  href: string;
  width: number;
  height: number;
  animated: boolean;
  variants: { width: number; avif: string; webp: string }[];
};

const byHref = new Map<string, ImageInfo | "missing">();

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
  throw new Error("找不到仓库根目录");
}

const repoRoot = findRepoRoot();
const imagesDir = join(repoRoot, "assets", "images");
const outDir = join(repoRoot, "astro", "public", "assets", "responsive");

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function hrefFor(file: string): string {
  return `/assets/images/${relative(imagesDir, file).split("\\").join("/")}`;
}

function variantName(
  digest: string,
  width: number,
  format: "avif" | "webp",
): string {
  return `${digest}-w${width}.${format}`;
}

async function buildOne(file: string): Promise<void> {
  const href = hrefFor(file);
  const ext = extname(file).toLowerCase();
  if (!RASTER.has(ext) && ext !== ".gif") return;

  try {
    const meta = await sharp(file, { animated: true }).metadata();
    const animated = ext === ".gif" || (meta.pages ?? 1) > 1;
    const width = meta.width ?? 0;
    const height = animated
      ? (meta.pageHeight ?? meta.height ?? 0)
      : (meta.height ?? 0);
    if (!width || !height) {
      byHref.set(href, "missing");
      return;
    }
    const digest = createHash("sha1")
      .update(href)
      .update(readFileSync(file))
      .digest("hex")
      .slice(0, 12);
    const info: ImageInfo = { href, width, height, animated, variants: [] };
    if (RASTER.has(ext) && !animated) {
      const widths: number[] = WIDTHS.filter((value) => value <= width);
      if (width <= 1600 && !widths.includes(width)) widths.push(width);
      widths.sort((a, b) => a - b);
      const source = sharp(file).rotate();
      for (const target of widths) {
        const avifName = variantName(digest, target, "avif");
        const webpName = variantName(digest, target, "webp");
        const avifPath = join(outDir, avifName);
        const webpPath = join(outDir, webpName);
        if (!existsSync(avifPath)) {
          await source
            .clone()
            .resize({ width: target, withoutEnlargement: true })
            .avif({ quality: 50 })
            .toFile(avifPath);
        }
        if (!existsSync(webpPath)) {
          await source
            .clone()
            .resize({ width: target, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(webpPath);
        }
        info.variants.push({
          width: target,
          avif: `/assets/responsive/${avifName}`,
          webp: `/assets/responsive/${webpName}`,
        });
      }
    }
    byHref.set(href, info);
  } catch {
    byHref.set(href, "missing");
  }
}

let ready: Promise<void> | undefined;

export function prepareResponsiveImages(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      mkdirSync(outDir, { recursive: true });
      const files = existsSync(imagesDir) ? walk(imagesDir) : [];
      for (const file of files) {
        await buildOne(file);
      }
    })();
  }
  return ready;
}

function attr(tag: string, name: string): string | null {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? null;
}

function srcset(info: ImageInfo, format: "avif" | "webp"): string {
  return info.variants
    .map((item) => `${item[format]} ${item.width}w`)
    .join(", ");
}

function lookup(src: string): ImageInfo | "missing" | undefined {
  let decoded = src;
  try {
    decoded = decodeURI(src);
  } catch {
    // keep the raw path when it is not a valid escape sequence
  }
  return byHref.get(decoded) ?? byHref.get(src);
}

export function imageMarkup(
  src: string,
  options: { alt?: string; className?: string; sizes?: string } = {},
): string {
  const info = lookup(src);
  const alt = options.alt ?? "";
  const classAttr = options.className ? ` class="${options.className}"` : "";
  if (!info || info === "missing") {
    return `<img src="${src}" alt="${alt}"${classAttr} loading="lazy" decoding="async">`;
  }
  const img = `<img src="${src}" alt="${alt}"${classAttr} width="${info.width}" height="${info.height}" loading="lazy" decoding="async">`;
  if (info.animated || info.variants.length === 0) return img;
  const sizes = options.sizes ?? ARTICLE_SIZES;
  return `<picture><source type="image/avif" srcset="${srcset(info, "avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(info, "webp")}" sizes="${sizes}">${img}</picture>`;
}

export function upgradeImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\bclass=["'][^"']*\blost-image/.test(tag)) return tag;
    const src = attr(tag, "src");
    if (!src || !src.startsWith("/assets/images/")) return tag;
    const className = attr(tag, "class") ?? undefined;
    return imageMarkup(src, { alt: attr(tag, "alt") ?? "", className });
  });
}
