import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
assert.match(html, /首页引言占位，待确认/, "首页引言应先使用占位文案");
assert.match(html, /post-tags/, "首页近期文章应露出标签");
assert.doesNotMatch(html, /HEAVEN BLOG/, "首页不应再使用占位 eyebrow");
assert.equal(
  existsSync(join(distDir, "CNAME")),
  false,
  "Astro 产物不得包含 CNAME，以免抢占正式域名",
);
assert.doesNotMatch(html, /jerryzou\.com/, "预览首页不得绑定正式域名");
assert.match(essay, /年的文章/, "随笔样本应回到年表而不是上一篇下一篇");
assert.match(essay, /year-mark">2026/, "文末年份入口应指向对应年表");
assert.doesNotMatch(essay, /上一篇|下一篇/, "文末不应出现上一篇下一篇");
assert.match(codePost, /<pre class="shiki/, "代码样本应保留代码块");
assert.match(codePost, /shiki/, "代码样本应使用 Shiki 构建期高亮");
assert.match(tablePost, /table-wrap/, "含表格的文章应可横向滚动而不是撑破版心");
assert.match(html, /RSS订阅/, "导航应恢复 RSS 入口");
assert.match(html, /application\/rss\+xml/, "首页应声明 RSS alternate");
assert.match(feed, /<rss version="2.0"/, "应输出 RSS 2.0");
assert.match(feed, /<title>咀嚼之味<\/title>/, "Feed 标题应保持原博客名称");
assert.match(feed, /<item>/, "Feed 应包含最近文章");
assert.match(feed, /<pubDate>/, "Feed 应由 @astrojs/rss 写出发布时间");
assert.match(
  feed,
  /14:30:00 GMT/,
  "Feed 应保留《浮在灰蒙蒙的海上》原文 22:30 +0800",
);
assert.doesNotMatch(feed, /\*\*/, "Feed 摘要不应残留 Markdown 强调记号");
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
assert.match(
  missingImagePost,
  /Trello 的同类软件<ul>/,
  "自学一文应保留双层列表结构",
);
{
  const cssHref = html.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
  assert.ok(cssHref, "首页应引用构建后的样式表");
  const css = await readFile(join(distDir, cssHref.slice(1)), "utf8");
  assert.match(css, /li>ul/, "嵌套列表应有比普通段落更紧的间距");
  assert.match(css, /Songti SC/, "阅读字体应包含中文衬线回退");
  assert.match(css, /Microsoft YaHei/, "阅读字体在无衬线时回退到系统黑体");
  assert.match(css, /--font-mono/, "日期与标签应使用等宽字体");
  assert.match(css, /#f8f6f2/, "浅色背景应使用淡暖纸色而不是过黄的纸色");
}

function expectedPublishedAt(raw) {
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2}):(\d{2}) ([+-]\d{4})$/,
  );
  if (!match) {
    throw new Error(`源日期格式超出测试约定：${raw}`);
  }
  const [, year, month, day, hour, minute, second, zone] = match;
  const offset = `${zone.slice(0, 3)}:${zone.slice(3)}`;
  return new Date(
    `${year}-${month}-${day}T${hour.padStart(2, "0")}:${minute}:${second}${offset}`,
  );
}

function proseHtml(page) {
  return page.match(
    /<div class="prose">([\s\S]*?)<\/div>\s*<p class="article-exit">/,
  )?.[1];
}

const repoRoot = join(distDir, "..", "..");
const postFiles = readdirSync(join(repoRoot, "_posts")).filter((name) =>
  name.endsWith(".md"),
);
assert.equal(postFiles.length, 51, "构建检查应覆盖全部 51 篇文章");

for (const filename of postFiles) {
  const source = readFileSync(join(repoRoot, "_posts", filename), "utf8");
  const permalink = source.match(/^permalink:\s*(.+)$/m)?.[1]?.trim();
  const date = source.match(/^date:\s*(.+)$/m)?.[1]?.trim();
  if (!permalink || !date) {
    throw new Error(`${filename} 缺少 permalink 或 date`);
  }
  const slug = permalink.replace(/^\/posts\/|\/$/g, "");
  const page = await readFile(
    join(distDir, "posts", slug, "index.html"),
    "utf8",
  );
  const datetime = page.match(/<time datetime="([^"]+)"/)?.[1];
  assert.equal(
    datetime,
    expectedPublishedAt(date).toISOString(),
    `${filename} 的 <time datetime> 应与 front matter 一致`,
  );
  const body = proseHtml(page);
  assert.ok(body, `${filename} 应有正文容器`);
  assert.doesNotMatch(
    body,
    /<script\b/i,
    `${filename} 正文不应留下可执行 script`,
  );
}

const rxjsPractice = await readFile(
  join(distDir, "posts/rxjs-practice-01/index.html"),
  "utf8",
);
assert.doesNotMatch(
  rxjsPractice,
  /codepen\.io\/assets\/embed/,
  "CodePen 不应再加载第三方 embed 脚本",
);
assert.match(
  rxjsPractice,
  /codepen\.io\/jerryzou\/pen\/XgppaN/,
  "CodePen 嵌入应转成指向原 pen 的静态链接",
);

console.log("Astro build smoke test passed.");
