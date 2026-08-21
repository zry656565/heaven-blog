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
- 站点默认图：`/assets/images/og-default.jpg`。
- 文章若正文里有仍存在的本地图，用第一张作为 `og:image`；否则回退到默认图。
- 不为每篇文章再生成带中文标题的独立图：自托管 CJK 字体的授权和体积收益还不明确。

## 微信

分两类能力，不能混为一谈：

1. **普通链接抓取**：依赖公开 HTML 里的 title、description、og 标签。本站已输出这些字段，微信会不会采用由客户端决定。
2. **JS-SDK 自定义分享**：页面在微信 UA 下会请求 `/api/wechat-jssdk`，用签名调用 `updateAppMessageShareData` / `updateTimelineShareData`。签名密钥放在 Cloudflare Pages 的 `WECHAT_APP_ID`、`WECHAT_APP_SECRET`，不进仓库。密钥未配置时接口返回 501，页面静默回退到 og 标签。

JS 接口安全域名必须 ICP 备案。`heaven-blog-next.pages.dev` 过不了这项校验，所以预览站上的 JS-SDK 在真机微信里不会生效。不必等切域名才能合代码；要在微信里验证自定义卡片，需要站点已经用 `jerryzou.com` 打开，并在公众号后台填入该域名。未认证订阅号通常没有自定义分享权限。

无法控制的行为包括：微信缓存旧卡片、用正文首图覆盖 og 图、在聊天里截断标题。

## 站点地图与 RSS

- 历史地址 `/sitemap.xml`、`/robots.txt`、`/feed.xml` 继续保留。
- sitemap 含首页、关于、所有文章、`/2/`–`/8/` 和全部正式文章 permalink。
- `/posts/shadowsocks-with-digitalocean/` 是旧兼容页，不进入 sitemap 或 RSS。
