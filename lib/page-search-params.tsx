/**
 * Server-side helpers for the global search-params pattern.
 *
 * Global client store (already in root layout):
 *   SearchParamsProvider (reads URL internally via Suspense) + useAppSearchParam()
 *
 * SSR / hydration:
 *   - RouteSearchParams commits via useLayoutEffect after the page mounts.
 *   - PDP: pass `initialUrlParams` / `initialProductData` from the server page for HTML that matches the URL.
 *   - Query-only layout chrome (`?layout=app`): use `useSearchParamsHydrated()` before changing shell markup.
 *
 * Next.js does NOT pass `searchParams` to root `layout.tsx`, only to `page.tsx`.
 * For ISR/static first paint with ?query=…, each page must still seed the store
 * once via <PageSearchParams /> or withPageSearchParams() — there is no layout-level
 * hook that avoids that without making the whole app dynamic (e.g. headers/cookies).
 */

import { RouteSearchParams } from "@context/SearchParamsContext";
import {
  parseServerSearchParams,
  type SearchParamsRecord,
  type ServerSearchParams,
} from "@lib/search-params";
import type { ReactNode } from "react";

export {
  parseServerSearchParams,
  type SearchParamsRecord,
  type ServerSearchParams,
};

/** Await + normalize `searchParams` from a Server Component page. */
export async function getPageSearchParams(
  searchParams: Promise<ServerSearchParams> | ServerSearchParams,
): Promise<SearchParamsRecord> {
  const resolved =
    searchParams instanceof Promise ? await searchParams : searchParams;
  return parseServerSearchParams(resolved);
}

/**
 * Seeds the global SearchParamsProvider for this navigation.
 * Wrap page output (or use withPageSearchParams).
 */
export function PageSearchParams({
  params,
  children,
}: {
  params: SearchParamsRecord;
  children?: ReactNode;
}) {
  return (
    <>
      <RouteSearchParams params={params} />
      {children}
    </>
  );
}

type PageWithSearchParamsProps = {
  searchParams: Promise<ServerSearchParams>;
};

/**
 * Server page HOC: parses searchParams, injects `parsedSearchParams`, mounts bridge.
 *
 * @example
 * async function OrdersPage({ parsedSearchParams, params }) { ... }
 * export default withPageSearchParams(OrdersPage);
 */
export function withPageSearchParams<
  P extends PageWithSearchParamsProps,
  Rest extends Omit<P, "searchParams">,
>(
  Page: (
    props: Rest & { parsedSearchParams: SearchParamsRecord },
  ) => ReactNode | Promise<ReactNode>,
) {
  return async function PageWithSearchParams(props: P) {
    const parsedSearchParams = await getPageSearchParams(props.searchParams);
    const { searchParams: _ignored, ...rest } = props;

    return (
      <PageSearchParams params={parsedSearchParams}>
        {await Page({
          ...(rest as Rest),
          parsedSearchParams,
        })}
      </PageSearchParams>
    );
  };
}
