《咀嚼之味》博客
===========

[![CircleCI](https://circleci.com/gh/zry656565/heaven-blog.svg?style=svg)](https://circleci.com/gh/zry656565/heaven-blog)

本博客遵循MIT开源协议。

## 改版验证

Astro 改版与旧 Jekyll 暂时并存。新站工程位于 [`astro/`](astro/)，使用 Node.js 22.12.0：

```bash
npm ci --prefix astro
npm --prefix astro run dev
```

提交前统一运行：

```bash
npm run verify
```

涉及历史 URL、页面元数据或现网链接时，再运行 `npm run verify:live`。迁移基线见 [`docs/migration-baseline.md`](docs/migration-baseline.md)。

### CI / CD

- **CI**：GitHub Actions（[`.github/workflows/verify.yml`](.github/workflows/verify.yml)）在 Pull Request 和 `master` 上执行 `npm ci --prefix astro` 与 `npm run verify`。权限仅为 `contents: read`。仓库里不放令牌；生产凭据只进 GitHub Secrets 或 Cloudflare 项目变量。
- **CD**：Cloudflare Pages 连接私有仓库 `heaven-blog-next`。正式域名切换只在 Stage 9。Stage 1 只用 `*.pages.dev` 预览。
- **推荐 Pages 设置**：项目名 `heaven-blog-next`；生产分支 `master`；Root directory `astro`；Build command `npm ci && npm run build`；Build output `dist`；Node `22.12.0`。不要勾选把根目录 `CNAME` 拷进产物。
- **预览失败**：Actions 检查失败应阻止合并；Pages 构建失败不得覆盖上一份成功部署。
- **回滚**：观察期内现网仍由公开仓库 + GitHub Pages / CircleCI 提供。Cloudflare 控制台可回退到上一次成功部署；不要在本阶段改 `jerryzou.com` DNS。
- **排查**：本地先 `npm run verify`；Actions 看 `verify` job 日志；Pages 看对应 commit 的 build log。预览域名用 `VERIFY_ORIGIN` 跑 `npm run verify:live`。

## 如何组建出我的博客
- Jekyll: 静态网站模版引擎
- Github Pages: 挂载博客的服务器
- grunt: 用于网站的静态文件自动合并压缩，并部署
- React: 使用React来组织“[所有文章](https://jerryzou.com/all-articles/)”页面

## 安装依赖环境

```bash
# 如果你的系统没有 ruby 环境，请先安装
# 使用 gem 安装主要的依赖
gem install jekyll bundler

# 安装依赖的 gem 包
bundle install

# 安装依赖的 npm 包
yarn install
```

## FAQ

1. 如果你无法在 Mac 上启动 Jekyll 参见[Jekyll on macOS](https://jekyllrb.com/docs/installation/macos/)

## 编译与部署

```bash
yarn grunt build      # 本地编译
yarn grunt debug      # 本地编译并启动测试服务器
yarn grunt release    # 本地编译出线上版本（应用各种优化）
yarn grunt serve      # 本地编译并启动测试服务器（应用各种优化）
yarn grunt deploy     # 将站点发布到 gh-pages 分支下
```
