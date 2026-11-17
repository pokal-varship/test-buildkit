import type { SearchParamsRecord } from "@lib/search-params";

/**
 * Stable key for comparing search-param records (order-independent).
 */
export function searchParamsFingerprint(params: SearchParamsRecord): string {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${params[k] ?? ""}`).join("&");
}

/**
 * Merge `params` into the global store after commit (e.g. useLayoutEffect).
 * Idempotent per fingerprint so Strict Mode double-invoke stays safe.
 */
export function commitSearchParamsIfChanged(
  merge: (patch: SearchParamsRecord) => void,
  params: SearchParamsRecord,
  committedFingerprint: { current: string | null },
): void {
  const fingerprint = searchParamsFingerprint(params);
  if (committedFingerprint.current === fingerprint) return;
  committedFingerprint.current = fingerprint;
  merge(params);
}
