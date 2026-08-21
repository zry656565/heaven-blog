import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = dirname(
  fileURLToPath(new URL("../dist/index.html", import.meta.url)),
);
const home = await readFile(join(distDir, "index.html"), "utf8");
const photoPost = await readFile(
  join(distDir, "posts/floating-on-the-grey-sea/index.html"),
  "utf8",
);
const stillsPost = await readFile(
  join(distDir, "posts/programmer-to-hr-unexpected-advantages/index.html"),
  "utf8",
);
const codePost = await readFile(
  join(distDir, "posts/rxjs-hooks/index.html"),
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

function imgs(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
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

for (const [name, page] of [
  ["随笔", photoPost],
  ["剧照文", stillsPost],
  ["代码文", codePost],
]) {
  const body = prose(page);
  const tags = imgs(body).filter((tag) => /\/assets\/images\//.test(tag));
  assert.ok(tags.length > 0, `${name} 应保留本地图片`);
  for (const [index, tag] of tags.entries()) {
    assert.match(
      tag,
      /\bwidth="\d+"/,
      `${name} 第 ${index + 1} 张图应有 width`,
    );
    assert.match(
      tag,
      /\bheight="\d+"/,
      `${name} 第 ${index + 1} 张图应有 height`,
    );
    if (index === 0) {
      assert.match(
        tag,
        /fetchpriority="high"/,
        `${name} 首图应为 LCP 优先加载`,
      );
      assert.match(tag, /loading="eager"/, `${name} 首图不应懒加载`);
    } else {
      assert.match(tag, /loading="lazy"/, `${name} 非首图应懒加载`);
    }
  }
  assert.match(body, /<picture>/, `${name} 的栅格图应使用 picture/srcset`);
  assert.match(body, /type="image\/avif"/, `${name} 应提供 AVIF 候选`);
  assert.match(body, /type="image\/webp"/, `${name} 应提供 WebP 候选`);
  assert.match(
    body,
    /srcset="[^"]*400w/,
    `${name} 应提供约 360/390px 屏可选用的 400w 候选`,
  );
  assert.match(
    body,
    /src="\/assets\/images\//,
    `${name} 的 img src 应保留历史图片 URL`,
  );
}

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
  existsSync(join(distDir, decodeURI(sampleSrc).slice(1))),
  true,
  "历史图片 URL 在产物中仍可访问",
);

const avifHref = photoPost.match(
  /srcset="(\/assets\/responsive\/[^"\s]+\.avif)/,
)?.[1];
assert.ok(avifHref, "随笔应引用生成的 AVIF");
assert.equal(
  existsSync(join(distDir, avifHref.slice(1))),
  true,
  "AVIF 变体应写入产物",
);

const originalSize = statSync(join(distDir, decodeURI(sampleSrc).slice(1))).size;
const webps = readdirSync(join(distDir, "assets/responsive")).filter((name) =>
  name.endsWith(".webp"),
);
assert.ok(webps.length > 0, "应产出 WebP 变体");
const smallestWebp = Math.min(
  ...webps.map(
    (name) => statSync(join(distDir, "assets/responsive", name)).size,
  ),
);
assert.ok(smallestWebp < originalSize, "至少有一张 WebP 应明显小于 2MB 级原图");

console.log("Image budget checks passed.");
