/**
 * Helpers for passing `searchParams` from Server Components (page/layout)
 * into Client Components without calling useSearchParams() during static/ISR prerender.
 */

export type SearchParamsRecord = Record<string, string>;

export type ServerSearchParams = Record<string, string | string[] | undefined>;

/** Normalize Next.js page `searchParams` into a flat string map (first value wins for arrays). */
export function parseServerSearchParams(
  searchParams: ServerSearchParams | undefined | null,
): SearchParamsRecord {
  if (!searchParams) return {};

  const result: SearchParamsRecord = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      const first = value.find((v) => v !== undefined && v !== "");
      if (first !== undefined) result[key] = first;
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function getSearchParam(
  params: SearchParamsRecord | undefined | null,
  key: string,
): string | undefined {
  if (!params) return undefined;
  const value = params[key];
  return value === "" ? undefined : value;
}

export function searchParamsToQueryString(
  params: SearchParamsRecord | undefined | null,
): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, value);
  }
  return qs.toString();
}

export function hasSearchParam(
  params: SearchParamsRecord | undefined | null,
  key: string,
): boolean {
  return getSearchParam(params, key) !== undefined;
}
