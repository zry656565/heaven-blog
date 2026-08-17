import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);

assert.match(html, /<html lang="zh-CN">/, "首页应声明中文语言");
assert.match(html, /<meta name="viewport"/, "首页应包含移动端 viewport");
assert.match(html, /<title>咀嚼之味<\/title>/, "首页标题应保持原博客名称");

console.log("Astro build smoke test passed.");
