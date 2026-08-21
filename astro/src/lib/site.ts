export const siteTitle = "咀嚼之味";
export const siteOwner = "邹润阳";
export const siteEmail = "jerry.zry@outlook.com";
export const siteDescription =
  "用语音和文字理解世界，做困难而有价值的事，珍惜人与人之间真诚的双向付出。";
export const defaultOgImage = "/assets/images/og-default.jpg";
export const fallbackSite = "https://heaven-blog-next.pages.dev";
export const HOME_PAGE_SIZE = 8;
export const PAGE_SIZE = 7;

export function archivePageCount(postCount: number): number {
  if (postCount <= HOME_PAGE_SIZE) return 1;
  return 1 + Math.ceil((postCount - HOME_PAGE_SIZE) / PAGE_SIZE);
}

export function archivePageRange(page: number): { start: number; end: number } {
  const start = HOME_PAGE_SIZE + (page - 2) * PAGE_SIZE;
  return { start, end: start + PAGE_SIZE };
}
