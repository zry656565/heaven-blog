# 迁移基线与决策

记录日期：2026-08-17

对应任务：Issue #2

## 已锁定范围

- 51 篇 Markdown 文章，逐篇记录源文件、标题、永久链接、正文 SHA-256、图片依赖和兼容风险。
- 65 条现网路由：51 篇文章、1 条旧地址兼容页、3 个普通页面、7 个分页、Feed、robots.txt 和 sitemap.xml。
- 每条现网路由记录状态码、标题、描述和 canonical；当前全部返回 HTTP 200。
- `/posts/shadowsocks-with-digitalocean/` 是保留中的旧兼容地址，当前以 HTTP 200 HTML 页面跳转到 `/posts/shadowsocks-and-digitalocean/`。
- `/posts/paperFormat/` 中的 `www.pdf-express.org` 被浏览器解释为站内相对链接，属于已知历史坏链；迁移时不能把它误判成新回归。

机器可读基线位于根目录的 `migration-contract.json`。默认验证不访问网络；`npm run verify:live` 会复核现网状态、元数据和站内链接。预览环境可通过 `VERIFY_ORIGIN` 指向其他域名。

## 内容兼容风险

| 项目 | 数量 |
| --- | ---: |
| 含兼容风险的文章 | 36 |
| Jekyll `highlight` 标签 | 27 |
| `site.static_url` 等 Liquid 变量 | 23 |
| 文中脚本标签 | 7 |
| 旧图片尺寸后缀 | 5 |
| 本地仓库缺失的图片引用 | 24 |

缺失图片分布在 9 篇旧文章中；完整路径已逐篇记录在迁移契约中。迁移前需从现网或旧发布分支回收，不能简单删除引用。

## 视觉与资源基线

- 主色：`#1abc9c`；链接辅助色：`#205caa`；页面背景：`#fdfdfd`。
- 正文字体：Avenir、Segoe UI、苹方兼容字体与系统无衬线字体栈。
- 正文：16px，行高 1.8，桌面内容宽度上限 760px；主要移动断点为 600px。
- 仓库图片约 12.5 MB；最大两张图片分别约 2.6 MB 和 2.3 MB，是移动端优化的明确对象。
- 本次网络样本：首页 HTML 约 10.4 KB，归档页约 22.5 KB，代表文章 HTML 约 6.3 KB；单次请求约 0.4–0.7 秒。该数据只作为粗略样本，不作为性能门槛。

视觉截图使用 Chrome 分别在 1280×720 和 390×844 viewport 下采集；保存前已验证实际 `innerWidth` 和 600px 媒体查询状态。移动文章正文宽度为 351px，没有横向溢出。

| 页面 | 桌面 | 移动 |
| --- | --- | --- |
| 首页 | [截图](baseline/screenshots/home-desktop.jpg) | [截图](baseline/screenshots/home-mobile.jpg) |
| 代表文章 | [截图](baseline/screenshots/post-desktop.jpg) | [截图](baseline/screenshots/post-mobile.jpg) |
| 归档页 | [截图](baseline/screenshots/archive-desktop.jpg) | [截图](baseline/screenshots/archive-mobile.jpg) |

### 移动性能样本

2026-08-17 使用 Lighthouse 13.4.1 的默认移动模拟采集：412×823、150ms RTT、约 1.6Mbps、4 倍 CPU slowdown。以下是单次实验室数据，只用于迁移前后同口径比较，不作为稳定性能承诺。

| 页面 | Performance | FCP | LCP | Speed Index | TBT | CLS | 总传输量 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 首页 | 90 | 2.2s | 2.9s | 4.7s | 10ms | 0 | 257 KiB |
| 代表文章 | 97 | 2.2s | 2.2s | 2.2s | 30ms | 0 | 2,513 KiB |
| 归档页 | 92 | 2.2s | 2.9s | 3.2s | 30ms | 0 | 295 KiB |

代表文章约 2.3 MB 的原图占页面传输量绝大部分；三个页面均加载约 190 KB 第三方分析脚本。首页和归档页的主要可优化对象是 Google/Baidu 分析脚本、旧 jQuery，以及归档页使用的旧 React；这些结论需在 Astro 版本中用同口径 Lighthouse 复测。

## 工程决策

| 事项 | 当前决定 | 最迟复核阶段 |
| --- | --- | --- |
| 输出模式 | Astro 静态输出；不为评论或统计引入 SSR | Stage 1 |
| Node | 最低并在 CI 固定为 22.12.0 | Stage 1 |
| 包管理器 | 新工程使用 npm，结束当前 Yarn/Grunt 双轨 | Stage 1 |
| 内容目录 | 迁移期保留 `_posts` 原文；目标中文目录 `src/content/blog/zh`，英文目录 `src/content/blog/en` | Stage 3 / Stage 7 |
| 中文 URL | 中文继续使用全部现有路径，不增加 `/zh/` | Stage 3 |
| 英文 URL | 使用 `/en/` 前缀，不影响中文 canonical | Stage 7 |
| 部署 | GitHub Actions 做 CI，Cloudflare Pages 做预览与部署 | Stage 1 |
| 评论 | Giscus；公开评论仓库及映射方式后定 | Stage 6 |
| 搜索 | 只接受静态、无服务端依赖方案；是否引入 Pagefind 后定 | Stage 2 |
| 分析 | 优先 Cloudflare Web Analytics；正式切换前确认 | Stage 9 |
| 字体 | 先使用系统字体；仅在授权、中文覆盖和性能收益明确时自托管 | Stage 2 |

## 当前构建限制

旧 Jekyll 构建依赖 Bundler 2.3.12，而当时系统 Ruby 未安装该版本。此处不继续扩建旧工具链；Stage 1 以全新 Astro 构建替代。新验证入口不依赖旧 Ruby、Grunt 或网络。

## 状态更新（Issue #13）

本仓库已删除 CircleCI、Grunt、Yarn 与 Jekyll 构建链。文章继续以 `_posts` 的历史 Markdown / Liquid 接入 Astro。`jerryzou.com` 现网回滚仍依赖公开仓库，直到 Stage 9。
