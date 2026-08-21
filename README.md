# 咀嚼之味

本博客遵循 MIT 开源协议。本仓库是私有改版仓库：站点由 Astro 构建，GitHub Actions 做 CI，Cloudflare Pages 做预览与部署。

文章仍写在 [`_posts/`](_posts/)（历史 Jekyll Markdown / Liquid），图片在 [`assets/images/`](assets/images/)。构建入口在 [`astro/`](astro/)。

## 本地

需要 Node.js 22.12.0（见 `.nvmrc`）：

```bash
npm ci --prefix astro
npm --prefix astro run dev
```

提交前：

```bash
npm run verify
```

`npm run verify:live` 对照现网 `jerryzou.com` 的旧站契约，不是给 Cloudflare 预览用的。迁移基线见 [`docs/migration-baseline.md`](docs/migration-baseline.md)。

## CI / CD

### CI：GitHub Actions

工作流 [`.github/workflows/verify.yml`](.github/workflows/verify.yml) 在 Pull Request 和 `master` 上执行：

1. 按 `.nvmrc` 安装 Node 22.12.0。
2. `npm ci --prefix astro`，锁定并缓存 `astro/package-lock.json`。
3. 根目录 `npm run verify`：迁移契约、密钥签名、Prettier、`astro check`、生产构建、日期与产物冒烟。

权限仅为 `contents: read`。仓库不放令牌。当前构建不需要 GitHub Secrets；Cloudflare 凭据只存在 Pages 项目里。

私有仓库无法开启 GitHub 分支保护（需要 Pro）。合并前仍应等 Actions 的 `verify` 变绿，不要在检查失败时合并。

### CD：Cloudflare Pages

- 项目：`heaven-blog-next`（已连接本私有仓库）
- 生产分支：`master`
- Root directory：`astro`
- Build command：`npm ci && npm run build`
- Build output：`dist`
- Node：`22.12.0`
- 不要把仓库根目录的 `CNAME` 拷进产物

PR 与非 `master` 分支出独立预览 URL。`master` 合并后自动发生产（当前是 `*.pages.dev`，不是 `jerryzou.com`）。Pages 构建失败不会覆盖上一份成功部署。

### 失败排查

1. 本地先跑 `npm run verify`。
2. Actions：看对应 commit 的 `verify` job 日志。
3. Pages：看对应 commit 的 build log。
4. 预览验收看 GitHub `verify`、Cloudflare 部署状态，以及关键端点：`/`、`/feed.xml`、`/robots.txt`、`/posts/shadowsocks-with-digitalocean/`（应为 301）。不要对预览站跑 `verify:live`：契约记录的是旧站 canonical / 标题 / 200 兼容页，预览站必然对不上。

### 回滚

- **本仓库 / 预览站**：在 Cloudflare 控制台回退到上一次成功部署。
- **jerryzou.com**：仍由公开仓库 `heaven-blog` + GitHub Pages / CircleCI 提供。本仓库已删除 CircleCI、Grunt 与 Jekyll 构建链，**不要**因此去关公开仓库的 CircleCI。正式切域名只在 Stage 9（#11），本阶段不改 DNS。
- 若 CircleCI 曾 follow 本私有仓库 `heaven-blog-next`，可在 CircleCI 控制台 unfollow，并删除只属于该项目的部署密钥。公开仓库的部署密钥必须留到 #11。

### 本仓库已移除

CircleCI 配置、Gruntfile、Yarn lock、Ruby Gemfile、Jekyll 布局，以及旧静态入口（根目录 `index.html` / `feed.xml` / `robots.txt`、`_includes`、`_layouts`、`pages/`、`articles.raw`、`assets/css`、`assets/js`）。它们不再参与构建。`CNAME` 仍保留；切域名属于 #11。
