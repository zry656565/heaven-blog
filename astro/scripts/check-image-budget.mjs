import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const distDir = dirname(
  fileURLToPath(new URL("../dist/index.html", import.meta.url)),
);
const home = await readFile(join(distDir, "index.html"), "utf8");
const about = await readFile(join(distDir, "about/index.html"), "utf8");
const photoPost = await readFile(
  join(distDir, "posts/floating-on-the-grey-sea/index.html"),
  "utf8",
);
const missingImagePost = await readFile(
  join(distDir, "posts/method-of-self-learning/index.html"),
  "utf8",
);

function prose(page) {
  return (
    page.match(
      /<div class="prose">([\s\S]*?)<\/div>\s*<p class="article-exit">/,
    )?.[1] ?? ""
  );
}

function decodeSrc(src) {
  try {
    return decodeURI(src);
  } catch {
    return src;
  }
}

async function frameSize(src) {
  const file = join(distDir, decodeSrc(src).slice(1));
  if (!existsSync(file)) return null;
  const ext = extname(file).toLowerCase();
  const meta = await sharp(file, { animated: true }).metadata();
  const animated = ext === ".gif" || (meta.pages ?? 1) > 1;
  return {
    animated,
    width: meta.width ?? 0,
    height: animated
      ? (meta.pageHeight ?? meta.height ?? 0)
      : (meta.height ?? 0),
  };
}

assert.doesNotMatch(
  home,
  /google-analytics|hm\.baidu|jquery/i,
  "首页不得再加载旧站第三方分析或 jQuery",
);
assert.doesNotMatch(
  home,
  /<script[^>]+src=["']https?:\/\//i,
  "首页不得在首屏引入外部脚本",
);

assert.match(about, /<picture>/, "关于页头像应使用 picture");
assert.match(
  about,
  /monkey-transparent\.png/,
  "关于页头像 img src 应保留历史 PNG",
);
assert.match(about, /type="image\/avif"/, "关于页头像应提供 AVIF");
assert.match(about, /srcset="[^"]*400w/, "关于页头像应提供 400w 候选");
assert.doesNotMatch(
  about,
  /<img class="monkey-avatar" src="\/assets\/images\/monkey-transparent\.png"\s*\/?>/,
  "关于页不得只输出原始 PNG",
);

const postDirs = readdirSync(join(distDir, "posts")).filter((name) =>
  existsSync(join(distDir, "posts", name, "index.html")),
);
assert.equal(postDirs.length, 51, "应检查全部 51 篇文章产物");

let staticCount = 0;
let animatedCount = 0;
for (const slug of postDirs) {
  const page = await readFile(
    join(distDir, "posts", slug, "index.html"),
    "utf8",
  );
  const body = prose(page);
  assert.doesNotMatch(
    body,
    /fetchpriority="high"/,
    `${slug} 普通正文图不应标记为高优先级`,
  );
  for (const block of body.matchAll(
    /(?:<picture>[\s\S]*?<\/picture>|<img\b[^>]*>)/gi,
  )) {
    const html = block[0];
    const src = html.match(/\bsrc="(\/assets\/images\/[^"]+)"/)?.[1];
    if (!src) continue;
    const img = html.match(/<img\b[^>]*>/i)?.[0] ?? html;
    const frame = await frameSize(src);
    assert.ok(frame?.width && frame.height, `${slug} ${src} 应能读取源图尺寸`);
    assert.match(
      img,
      new RegExp(`\\bwidth="${frame.width}"`),
      `${slug} ${src} 的 width 应为单帧 ${frame.width}`,
    );
    assert.match(
      img,
      new RegExp(`\\bheight="${frame.height}"`),
      `${slug} ${src} 的 height 应为单帧 ${frame.height}`,
    );
    assert.match(img, /loading="lazy"/, `${slug} ${src} 应懒加载`);
    if (frame.animated) {
      animatedCount += 1;
      assert.doesNotMatch(
        html,
        /<picture>/,
        `${slug} 动画 ${src} 不应被转成静帧 picture`,
      );
      continue;
    }
    staticCount += 1;
    assert.match(html, /<picture>/, `${slug} ${src} 应使用 picture/srcset`);
    assert.match(html, /400w/, `${slug} ${src} 应提供 400w 候选`);
    const avif = html.match(/(\/assets\/responsive\/[^"\s]+\.avif)/)?.[1];
    const webp = html.match(/(\/assets\/responsive\/[^"\s]+\.webp)/)?.[1];
    assert.ok(
      avif && existsSync(join(distDir, avif.slice(1))),
      `${src} 的 AVIF 应变体存在`,
    );
    assert.ok(
      webp && existsSync(join(distDir, webp.slice(1))),
      `${src} 的 WebP 应变体存在`,
    );
  }
}

assert.ok(staticCount > 0, "应覆盖静态栅格图");
assert.ok(animatedCount >= 6, "应保留至少 6 张动画 WebP/GIF 不转静帧");

assert.match(
  missingImagePost,
  /lost-image/,
  "缺失原图仍应显示失联占位，而不是空 img",
);
const sampleSrc = photoPost.match(
  /src="(\/assets\/images\/posts\/[^"]+\.png)"/,
)?.[1];
assert.ok(sampleSrc, "随笔应保留原 PNG 路径");
assert.equal(
  existsSync(join(distDir, decodeSrc(sampleSrc).slice(1))),
  true,
  "历史图片 URL 在产物中仍可访问",
);

const originalSize = statSync(
  join(distDir, decodeSrc(sampleSrc).slice(1)),
).size;
const avifHref = photoPost.match(
  /srcset="(\/assets\/responsive\/[^"\s]+\.avif)/,
)?.[1];
assert.ok(avifHref, "随笔应引用生成的 AVIF");
const avifSize = statSync(join(distDir, avifHref.slice(1))).size;
assert.ok(avifSize < originalSize / 5, "随笔主图的 AVIF 应远小于原 PNG");

const headers = await readFile(join(distDir, "_headers"), "utf8");
assert.match(headers, /\/assets\/responsive\/\*/, "响应式变体应配置长期缓存");

console.log(
  `Image budget checks passed (${staticCount} static, ${animatedCount} animated).`,
);
