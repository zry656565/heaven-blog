export function plainText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function absoluteUrl(
  path: string,
  site: URL | string | undefined,
): string {
  const origin = site ?? "https://heaven-blog-next.pages.dev";
  return new URL(path, origin).href;
}
