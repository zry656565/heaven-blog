# 咀嚼之味

「咀嚼之味」个人博客的 Astro 版本。迁移保留原有文章、历史 URL 和文字气质；站点由 Cloudflare Pages 托管，评论使用 Twikoo + 腾讯云 CloudBase。

文章仍维护在 [`_posts/`](_posts/)，图片位于 [`assets/images/`](assets/images/)，Astro 工程位于 [`astro/`](astro/)。

## 本地开发

需要 Node.js 22.12.0（见 [`.nvmrc`](.nvmrc)）：

```bash
npm ci --prefix astro
npm --prefix astro run dev
```

提交前运行：

```bash
npm run verify
```

这会检查迁移契约、敏感信息、代码格式、类型、生产构建和构建产物。`npm run verify:live` 仅用于对照 `jerryzou.com` 的旧站契约，不用于 Pages 预览验收。

## 目录

- [`_posts/`](_posts/)：历史 Jekyll Markdown / Liquid 文章。
- [`astro/`](astro/)：Astro 页面、样式和构建脚本。
- [`migration-contract.json`](migration-contract.json)：历史文章与 URL 契约。
- [`docs/`](docs/)：迁移、SEO 和响应式图片说明。

## 部署

GitHub Actions 在 Pull Request 和 `master` 上执行 `npm run verify`。Cloudflare Pages 连接本仓库：非 `master` 分支生成预览，`master` 自动发布。

Pages 构建设置：

- Root directory：`astro`
- Build command：`npm ci && npm run build`
- Build output：`dist`
- Node：`22.12.0`

## 评论

文章页和关于页使用 Twikoo 1.7.19。Pages 需要配置：

- `PUBLIC_TWIKOO_ENV_ID`：CloudBase 环境 ID。
- `PUBLIC_TWIKOO_REGION`：可选；上海环境为 `ap-shanghai`。

Twikoo 在评论启用时懒加载；未配置或加载失败不会影响正文。安装脚本会校验并修复 Twikoo 1.7.19 与 CloudBase Web SDK 4 的认证兼容问题，升级版本前必须重新审查。

如需重新生成 Disqus 导入文件：

```bash
npm run comments:prepare-disqus -- /path/to/disqus.xml.gz /private/path/disqus-for-twikoo.xml --public-existing-only
```

原始导出、修正版 XML、恢复计划和数据库快照均包含个人信息，不得提交仓库。

## License

MIT
