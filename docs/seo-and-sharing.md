# SEO 与分享卡片

对应 Issue #6。预览站 `site` 仍是 `https://heaven-blog-next.pages.dev`。正式 canonical 改到 `https://jerryzou.com` 属于 Stage 9，本阶段不改 DNS、CNAME 或生产域名。

## 页面元数据

- 每页输出 `title`、`description`、`canonical`、`robots`、Open Graph、X Card 和 JSON-LD。
- 文章使用自己的摘要，不用首页通用介绍。
- `description` 会去掉 Markdown 记号后再写入 meta。
- 中文页声明 `lang="zh-CN"`、`og:locale=zh_CN`，并同时输出 `hreflang="zh-CN"` 与 `hreflang="x-default"` 指向同一 canonical。英文页与成对 hreflang 留给 Stage 7，现在没有 `/en/` 路由，也不伪造英文 canonical。

## 分享图

- 尺寸：1200×630。
- 格式：JPEG，体积小于 300 KB。
- 地址：HTTPS 绝对 URL，随 `Astro.site` 生成。
- 安全区：标题与站点名离开边缘至少约 40px。
- 站点默认图：`/assets/images/og-default.jpg`（1200×630）。
- 所有页面统一使用这张默认图，不自动取正文首图。文章以后如需覆盖，再加显式字段。
- 不为每篇文章再生成带中文标题的独立图：自托管 CJK 字体的授权和体积收益还不明确。

## 微信

本阶段不做 JS-SDK。分享卡片完全依赖公开 HTML 的 title、description 和 og 标签，属于 best effort：微信会不会采用、用标题还是首图，由客户端和缓存决定，不是已保证的能力。

无法控制的行为包括：微信缓存旧卡片、用正文首图覆盖 og 图、在聊天里截断标题，或抓取失败后只显示素链接。

## 站点地图与 RSS

- 历史地址 `/sitemap.xml`、`/robots.txt`、`/feed.xml` 继续保留。
- sitemap 含首页、关于、所有文章、`/2/`–`/8/` 和全部正式文章 permalink。
- `/posts/shadowsocks-with-digitalocean/` 不进入 sitemap 或 RSS。新站通过 Cloudflare `_redirects` 永久 301 到现行 permalink；迁移契约仍记录旧站当时是 HTTP 200。
