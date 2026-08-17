import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = dirname(
  fileURLToPath(new URL("../dist/index.html", import.meta.url)),
);
const html = await readFile(join(distDir, "index.html"), "utf8");

assert.match(html, /<html lang="zh-CN">/, "首页应声明中文语言");
assert.match(html, /<meta name="viewport"/, "首页应包含移动端 viewport");
assert.match(html, /<title>咀嚼之味<\/title>/, "首页标题应保持原博客名称");
assert.equal(
  existsSync(join(distDir, "CNAME")),
  false,
  "Astro 产物不得包含 CNAME，以免抢占正式域名",
);
assert.doesNotMatch(html, /jerryzou\.com/, "预览首页不得绑定正式域名");

console.log("Astro build smoke test passed.");
