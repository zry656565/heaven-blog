# 响应式图片

对应 Issue #7。历史地址 `/assets/images/...` 仍作为 `<img src>` 回退，不改原文路径。

构建时用 sharp 为本地栅格图生成 400 / 800 / 1200（不超过原图宽度）的 AVIF 与 WebP，输出到 `/assets/responsive/`，用 `<picture>` + `srcset` / `sizes`。`sizes` 按版心：小屏 `calc(100vw - 1.5rem)`，桌面 `42rem`。

策略：

- JPEG / PNG / WebP / BMP：出多宽度变体；透明 PNG 走 AVIF/WebP 保 alpha。
- GIF：保留动画，只补 width/height，不做静帧转码。
- SVG：不栅格化。
- 超长图：按宽度缩放，CSS `max-width: 100%; height: auto`。
- 剧照 / 截图：与普通栅格图相同；不放大超过原像素。
- 正文图默认 `loading="lazy"`，不设 `fetchpriority`。本站没有文章 hero；若以后有真正首屏主图，再按页面显式开启。
- 关于页头像同样走 `<picture>`，`sizes` 为 `6.5rem`。
- 变体文件名含源文件内容哈希；同路径换图会生成新文件。`/assets/responsive/*` 使用长期 immutable 缓存。
- 缺失图：继续用失联占位，不生成变体。
- 字体：继续系统栈，不自托管。

评论、统计不在本 Stage 引入。自动检查见 `astro/scripts/check-image-budget.mjs`。
