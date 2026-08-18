import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = dirname(
  fileURLToPath(new URL("../dist/index.html", import.meta.url)),
);
const html = await readFile(join(distDir, "index.html"), "utf8");
const essay = await readFile(
  join(distDir, "posts/floating-on-the-grey-sea/index.html"),
  "utf8",
);
const codePost = await readFile(
  join(distDir, "posts/rxjs-hooks/index.html"),
  "utf8",
);
const tablePost = await readFile(
  join(distDir, "posts/cookie-and-web-storage/index.html"),
  "utf8",
);
const missingImagePost = await readFile(
  join(distDir, "posts/method-of-self-learning/index.html"),
  "utf8",
);
const feed = await readFile(join(distDir, "feed.xml"), "utf8");

assert.match(html, /<html lang="zh-CN">/, "首页应声明中文语言");
assert.match(html, /<meta name="viewport"/, "首页应包含移动端 viewport");
assert.match(html, /<title>咀嚼之味<\/title>/, "首页标题应保持原博客名称");
assert.match(html, /data-theme-toggle/, "首页应提供主题切换");
assert.match(html, /data-menu-toggle/, "移动导航应可点按，不依赖 hover");
assert.match(html, /跳到正文/, "应提供跳到正文链接");
assert.match(html, /浮在灰蒙蒙的海上/, "首页应列出真实文章标题");
assert.doesNotMatch(html, /HEAVEN BLOG/, "首页不应再使用占位 eyebrow");
assert.equal(
  existsSync(join(distDir, "CNAME")),
  false,
  "Astro 产物不得包含 CNAME，以免抢占正式域名",
);
assert.doesNotMatch(html, /jerryzou\.com/, "预览首页不得绑定正式域名");
assert.match(essay, /2026 年的文章/, "随笔样本应回到年表而不是上一篇下一篇");
assert.doesNotMatch(essay, /上一篇|下一篇/, "文末不应出现上一篇下一篇");
assert.match(codePost, /<pre>/, "代码样本应保留代码块");
assert.match(codePost, /hljs/, "代码样本应有构建期语法高亮");
assert.match(tablePost, /table-wrap/, "含表格的文章应可横向滚动而不是撑破版心");
assert.match(html, /RSS订阅/, "导航应恢复 RSS 入口");
assert.match(html, /application\/rss\+xml/, "首页应声明 RSS alternate");
assert.match(feed, /<rss version="2.0"/, "应输出 RSS 2.0");
assert.match(feed, /<title>咀嚼之味<\/title>/, "Feed 标题应保持原博客名称");
assert.match(feed, /<item>/, "Feed 应包含最近文章");
assert.doesNotMatch(feed, /jerryzou\.com/, "预览 Feed 不得绑定正式域名");
assert.match(
  essay,
  /<img src="\/assets\/images\/posts\/[^"]+\.png"/,
  "有原图的文章应继续输出真实图片",
);
assert.doesNotMatch(essay, /lost-image/, "有原图的文章不应显示失联占位");
assert.doesNotMatch(
  missingImagePost,
  /&quot;自学&quot;|“自学” · “思维导图”|"自学"/,
  "标签不应残留 YAML 引号",
);
assert.match(
  missingImagePost,
  /自学 · 思维导图/,
  "带引号的 YAML 标签应显示为纯文本",
);
assert.match(
  missingImagePost,
  /图片已失联在历史的海洋中/,
  "缺失原图应显示失联占位",
);
assert.doesNotMatch(
  missingImagePost,
  /<img[^>]+xmind\.png/,
  "缺失原图不应再输出失效 img",
);

console.log("Astro build smoke test passed.");
