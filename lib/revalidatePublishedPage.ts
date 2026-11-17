import { revalidatePath } from "next/cache";
import { invalidatePublishedPageDataCache } from "services/pageManagement";

const normalizePagePath = (pagePath: string): string =>
  pagePath === "" ? "/" : pagePath;

/** App routes to revalidate after a live publish (extend as more pages use ISR). */
const LIVE_PUBLISH_REVALIDATE_ROUTES: Record<string, string[]> = {
  "/": ["/"],
};

/**
 * Invalidates Next.js ISR/full-route cache and in-memory published page cache.
 * Server-only — call from route handlers or server actions.
 */
export function revalidatePublishedPage(pagePath: string): string[] {
  const normalizedPath = normalizePagePath(pagePath);
  const routes = LIVE_PUBLISH_REVALIDATE_ROUTES[normalizedPath];

  if (!routes?.length) {
    return [];
  }

  for (const route of routes) {
    revalidatePath(route);
  }

  invalidatePublishedPageDataCache(normalizedPath);

  return routes;
}

export function shouldRevalidateOnLivePublish(pagePath: string): boolean {
  const normalizedPath = normalizePagePath(pagePath);
  return Boolean(LIVE_PUBLISH_REVALIDATE_ROUTES[normalizedPath]?.length);
}
