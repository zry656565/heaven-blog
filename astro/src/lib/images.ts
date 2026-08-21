import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTHS = [400, 800, 1200] as const;
const SIZES = "(max-width: 600px) calc(100vw - 1.5rem), 42rem";
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp"]);
const ANIMATED = new Set([".gif"]);

export type ImageInfo = {
  href: string;
  width: number;
  height: number;
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
  href: string,
  width: number,
  format: "avif" | "webp",
): string {
  const id = createHash("sha1").update(href).digest("hex").slice(0, 12);
  return `${id}-w${width}.${format}`;
}

async function buildOne(file: string): Promise<void> {
  const href = hrefFor(file);
  const ext = extname(file).toLowerCase();
  if (!RASTER.has(ext) && !ANIMATED.has(ext)) return;

  try {
    const meta = await sharp(file, { animated: ANIMATED.has(ext) }).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (!width || !height) {
      byHref.set(href, "missing");
      return;
    }

    const info: ImageInfo = { href, width, height, variants: [] };
    if (RASTER.has(ext) && !meta.pages) {
      const widths: number[] = WIDTHS.filter((value) => value <= width);
      if (width <= 1600 && !widths.includes(width)) widths.push(width);
      widths.sort((a, b) => a - b);
      const source = sharp(file).rotate();
      for (const target of widths) {
        const avifName = variantName(href, target, "avif");
        const webpName = variantName(href, target, "webp");
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

export function upgradeImages(html: string): string {
  let first = true;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\bclass=["'][^"']*\blost-image/.test(tag)) return tag;
    const src = attr(tag, "src");
    if (!src || !src.startsWith("/assets/images/")) return tag;
    let decoded = src;
    try {
      decoded = decodeURI(src);
    } catch {
      // keep the raw path when it is not a valid escape sequence
    }
    const info = byHref.get(decoded) ?? byHref.get(src);
    if (!info || info === "missing") return tag;

    const isLcp = first;
    first = false;
    const alt = attr(tag, "alt") ?? "";
    const loading = isLcp ? "eager" : "lazy";
    const extra = isLcp ? ` fetchpriority="high"` : "";
    const img = `<img src="${src}" alt="${alt}" width="${info.width}" height="${info.height}" loading="${loading}" decoding="async"${extra}>`;
    if (info.variants.length === 0) return img;
    return `<picture><source type="image/avif" srcset="${srcset(info, "avif")}" sizes="${SIZES}"><source type="image/webp" srcset="${srcset(info, "webp")}" sizes="${SIZES}">${img}</picture>`;
  });
}
