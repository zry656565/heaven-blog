// 只处理正文里的 CodePen 嵌入和 <script>，不是通用 HTML sanitizer。

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function attr(source: string, name: string): string | null {
  return (
    source.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? null
  );
}

function rewriteCodePenEmbeds(html: string): string {
  const withoutLoader = html.replace(
    /<script\b[^>]*src=["'][^"']*codepen\.io\/[^"']*["'][^>]*>\s*<\/script>/gi,
    "",
  );

  return withoutLoader.replace(
    /<p\b([^>]*\bclass=["'][^"']*\bcodepen\b[^"']*["'][^>]*)>[\s\S]*?<\/p>/gi,
    (full, attrs: string) => {
      const slug = attr(attrs, "data-slug-hash");
      const user = attr(attrs, "data-user") ?? "jerryzou";
      const title = attr(attrs, "data-pen-title") ?? "CodePen";
      if (!slug) return full;
      const href = `https://codepen.io/${user}/pen/${slug}`;
      return `<figure class="embed-card"><a href="${href}" rel="noopener noreferrer">在 CodePen 打开：${escapeHtml(title)}</a></figure>`;
    },
  );
}

function neutralizeScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, (tag) => {
    return `<pre class="blocked-script"><code>${escapeHtml(tag)}</code></pre>`;
  });
}

export function rewriteArticleScripts(html: string): string {
  return neutralizeScripts(rewriteCodePenEmbeds(html));
}
