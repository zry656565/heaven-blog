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
assert.match(
  html,
  /用语音和文字理解世界，做困难而有价值的事，珍惜人与人之间真诚的双向付出。/,
  "首页应显示确认后的引言",
);
assert.doesNotMatch(html, /首页引言占位，待确认/, "首页不应再出现引言占位");
const about = await readFile(join(distDir, "about/index.html"), "utf8");
assert.match(
  about,
  /是一个写了十多年代码的程序员，如今深耕人事工作，对创造一家生机勃勃的公司充满好奇/,
  "关于页应说明如今深耕人事工作",
);
assert.match(essay, /article-copyright/, "文章页应保留版权声明");
assert.match(
  essay,
  /creativecommons\.org\/licenses\/by-nc\/3\.0/,
  "文章页版权应指向 CC BY-NC 3.0",
);
assert.match(
  essay,
  /mailto:jerry\.zry@outlook\.com/,
  "文章页版权应指向作者邮箱",
);
assert.doesNotMatch(html, /article-copyright/, "首页不应出现文章版权声明");
assert.doesNotMatch(about, /article-copyright/, "关于页不应出现文章版权声明");
assert.match(
  about,
  /让我感到幸福的，通常是理解了一件新事物/,
  "关于页应保留幸福感与长期投入的说明",
);
assert.match(
  about,
  /\/assets\/images\/monkey-transparent\.png/,
  "关于页应使用透明底头像",
);
assert.match(
  about,
  /data-comment-path="\/about\/"/,
  "关于页应保留历史评论 path",
);
assert.match(html, /post-tags/, "首页近期文章应露出标签");
assert.doesNotMatch(html, /HEAVEN BLOG/, "首页不应再使用占位 eyebrow");
assert.equal(
  existsSync(join(distDir, "CNAME")),
  false,
  "Astro 产物不得包含 CNAME，以免抢占正式域名",
);
assert.doesNotMatch(html, /jerryzou\.com/, "预览首页不得绑定正式域名");
assert.match(html, /rel="canonical"/, "首页应声明 canonical");
assert.match(
  html,
  /href="https:\/\/heaven-blog-next\.pages\.dev\/"/,
  "预览 canonical 应使用 pages.dev，而不是正式域名",
);
assert.match(
  html,
  /name="description" content="用语音和文字理解世界，做困难而有价值的事，珍惜人与人之间真诚的双向付出。"/,
  "站点 description 应使用首页引言，而不是旧自我介绍",
);
assert.doesNotMatch(html, /安静的事/, "站点 description 不应再使用旧文案");
assert.match(html, /property="og:title"/, "首页应输出 Open Graph 标题");
assert.match(html, /application\/ld\+json/, "首页应包含 JSON-LD");
assert.doesNotMatch(html, /wechat-jssdk|jweixin/, "本阶段不应接入微信 JS-SDK");
assert.match(html, /hreflang="zh-CN"/, "中文页应声明 hreflang");
assert.match(
  html,
  /hreflang="x-default"/,
  "在英文页出现前 x-default 指向中文 canonical",
);
assert.match(html, /\/assets\/images\/favicon\.ico/, "首页应声明 favicon");
assert.match(essay, /年的文章/, "随笔样本应回到年表而不是上一篇下一篇");
assert.match(essay, /year-mark">2026/, "文末年份入口应指向对应年表");
assert.doesNotMatch(essay, /上一篇|下一篇/, "文末不应出现上一篇下一篇");
assert.match(essay, /data-twikoo-comments/, "文章页应包含 Twikoo 评论容器");
assert.match(
  essay,
  /data-comment-path="\/posts\/floating-on-the-grey-sea\/"/,
  "评论 path 应使用带尾部斜杠的历史 permalink",
);
assert.match(
  essay,
  /property="og:type" content="article"/,
  "文章页 og:type 应为 article",
);
assert.match(
  essay,
  /og:description" content="两年前的一个深夜/,
  "文章页不得误用首页通用分享文案",
);
assert.match(essay, /"@type":"BlogPosting"/, "文章页 JSON-LD 应为 BlogPosting");
assert.match(
  essay,
  /og:image" content="https:\/\/heaven-blog-next\.pages\.dev\/assets\/images\/og-default\.jpg"/,
  "文章页应使用统一默认分享图，不自动取正文首图",
);
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
  assert.match(css, /#117865/, "浅色主题文字强调色应达到可读对比度");
  assert.match(
    css,
    /page-title\s*\+\s*\.year-group/,
    "所有文章页大标题与首个年份之间应有额外留白",
  );
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
    /<div class="prose">([\s\S]*?)<\/div>\s*<footer class="article-footer">/,
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
  assert.match(
    page,
    new RegExp(
      `data-comment-path="${permalink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`,
    ),
    `${filename} 的评论 path 应与历史 permalink 完全一致`,
  );
}

const contract = JSON.parse(
  readFileSync(join(repoRoot, "migration-contract.json"), "utf8"),
);
const aliasPath = "/posts/shadowsocks-with-digitalocean/";
for (const route of contract.routes) {
  if (route.path === aliasPath) continue;
  const filePath =
    route.path === "/feed.xml" ||
    route.path === "/robots.txt" ||
    route.path === "/sitemap.xml"
      ? join(distDir, route.path.slice(1))
      : join(distDir, route.path.slice(1), "index.html");
  assert.equal(
    existsSync(filePath),
    true,
    `历史路由应有对应产物：${route.path}`,
  );
}

function listPermalinks(pageHtml) {
  const list =
    pageHtml.match(/<ol class="post-list">([\s\S]*?)<\/ol>/)?.[1] ?? "";
  return [...list.matchAll(/href="(\/posts\/[^"]+\/)"/g)].map(
    (match) => match[1],
  );
}

const homeLinks = listPermalinks(html);
assert.equal(homeLinks.length, 8, "首页应列出 8 篇近作");
const listed = new Set(homeLinks);
let archivePage = 2;
while (existsSync(join(distDir, String(archivePage), "index.html"))) {
  const pageHtml = await readFile(
    join(distDir, String(archivePage), "index.html"),
    "utf8",
  );
  const links = listPermalinks(pageHtml);
  assert.ok(links.length > 0, `/${archivePage}/ 不应为空`);
  assert.ok(links.length <= 7, `/${archivePage}/ 每页最多 7 篇`);
  for (const link of links) {
    assert.equal(
      listed.has(link),
      false,
      `${link} 不应同时出现在首页或更前分页与 /${archivePage}/`,
    );
    listed.add(link);
  }
  archivePage += 1;
}
assert.equal(
  listed.size,
  postFiles.length,
  "首页加分页应恰好覆盖全部文章且无重复",
);

const pageTwo = await readFile(join(distDir, "2/index.html"), "utf8");
assert.match(
  pageTwo,
  /<title>文章归档第 2 页 \| 咀嚼之味<\/title>/,
  "/2/ 的 title 应体现页码",
);
assert.match(
  pageTwo,
  /og:title" content="文章归档第 2 页 \| 咀嚼之味"/,
  "/2/ 的 OG title 应体现页码",
);
assert.match(pageTwo, /文章归档第 2 页/, "/2/ 的 description 应体现页码");
assert.match(pageTwo, /上一页/, "/2/ 应能回到首页");
assert.match(pageTwo, /下一页/, "/2/ 应能翻到更早一页");

const redirects = await readFile(join(distDir, "_redirects"), "utf8");
assert.match(
  redirects,
  /\/posts\/shadowsocks-with-digitalocean\/\s+\/posts\/shadowsocks-and-digitalocean\/\s+301/,
  "旧 shadowsocks 地址应 301 到现行 permalink",
);
assert.equal(
  existsSync(join(distDir, "posts/shadowsocks-with-digitalocean/index.html")),
  false,
  "旧 shadowsocks 地址不应再输出 HTML 兼容页，以免挡住 301",
);

const chew = await readFile(join(distDir, "posts/chew/index.html"), "utf8");
assert.match(
  chew,
  /<title>咀嚼之味 \| 咀嚼之味<\/title>/,
  "《咀嚼之味》一文标题应保留重复站点名",
);
const dontBeEvil = await readFile(
  join(distDir, "posts/dontBeEvil/index.html"),
  "utf8",
);
assert.match(
  dontBeEvil,
  /<title>Don(?:'|&#39;)t be evil \? \| 咀嚼之味<\/title>/,
  "Don't be evil 的历史标题应原样保留",
);

const timeTravel = await readFile(
  join(distDir, "posts/the-integral-of-now-a-guide-to-time-travel/index.html"),
  "utf8",
);
assert.doesNotMatch(
  timeTravel,
  /og:description"[^>]*\*\*/,
  "文章分享摘要不应残留 Markdown 强调记号",
);
assert.match(
  timeTravel,
  /时间旅行/,
  "去掉 Markdown 后仍应保留时间旅行一文的摘要",
);

const sitemap = await readFile(join(distDir, "sitemap.xml"), "utf8");
const robots = await readFile(join(distDir, "robots.txt"), "utf8");
assert.match(sitemap, /<urlset /, "应输出 sitemap.xml");
assert.match(
  sitemap,
  /https:\/\/heaven-blog-next\.pages\.dev\/posts\/floating-on-the-grey-sea\//,
  "sitemap 应包含正式文章 permalink",
);
assert.match(sitemap, /\/2\//, "sitemap 应包含历史分页");
assert.doesNotMatch(
  sitemap,
  /shadowsocks-with-digitalocean/,
  "旧兼容地址不应进入 sitemap",
);
assert.doesNotMatch(sitemap, /jerryzou\.com/, "预览 sitemap 不得绑定正式域名");
assert.match(
  robots,
  /Sitemap: https:\/\/heaven-blog-next\.pages\.dev\/sitemap\.xml/,
  "robots.txt 应指向预览 sitemap",
);

const graphql = await readFile(
  join(distDir, "posts/10-questions-about-graphql/index.html"),
  "utf8",
);
assert.match(
  graphql,
  /og:description" content="我在使用 GraphQL/,
  "GraphQL 一文应使用自己的摘要",
);

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
