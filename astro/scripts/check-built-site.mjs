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
assert.match(tablePost, /table-wrap/, "含表格的文章应可横向滚动而不是撑破版心");

console.log("Astro build smoke test passed.");
