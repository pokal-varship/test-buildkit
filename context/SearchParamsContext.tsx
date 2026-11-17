"use client";

import {
  searchParamsToQueryString,
  type SearchParamsRecord,
} from "@lib/search-params";
import { resolveAuthToken } from "@lib/tokenValidation";
import {
  commitSearchParamsIfChanged,
  searchParamsFingerprint,
} from "@lib/commit-search-params";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type SearchParamsContextValue = {
  params: SearchParamsRecord;
  get: (key: string) => string | undefined;
  has: (key: string) => boolean;
  toString: () => string;
};

const EMPTY: SearchParamsRecord = {};

const SearchParamsContext = createContext<SearchParamsContextValue | null>(
  null,
);

function recordsEqual(a: SearchParamsRecord, b: SearchParamsRecord): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

function mergeRecords(
  base: SearchParamsRecord,
  patch: SearchParamsRecord,
): SearchParamsRecord {
  if (Object.keys(patch).length === 0) return base;
  return { ...base, ...patch };
}

type Store = {
  params: SearchParamsRecord;
  listeners: Set<() => void>;
};

function createStore(initial: SearchParamsRecord): Store {
  return { params: initial, listeners: new Set() };
}

function subscribe(store: Store, listener: () => void) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

function getSnapshot(store: Store) {
  return store.params;
}

/** Updates the external store without notifying subscribers (safe during own render). */
function applyPatchToStoreSilent(store: Store, patch: SearchParamsRecord): void {
  const next = mergeRecords(store.params, patch);
  if (recordsEqual(store.params, next)) return;
  store.params = next;
}

function mergeIntoStore(store: Store, patch: SearchParamsRecord) {
  const next = mergeRecords(store.params, patch);
  if (recordsEqual(store.params, next)) return;
  store.params = next;
  store.listeners.forEach((l) => l());
}

function parseUrlSearchParams(
  nextParams: ReturnType<typeof useSearchParams>,
): SearchParamsRecord {
  const record: SearchParamsRecord = {};
  nextParams?.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

/**
 * Owns the external store. `urlParams` is applied during this component's render
 * so context updates without cross-component setState (React 19-safe).
 */
function SearchParamsProviderInner({
  children,
  initialSearchParams = EMPTY,
  urlParams = EMPTY,
}: {
  children: React.ReactNode;
  initialSearchParams?: SearchParamsRecord;
  urlParams?: SearchParamsRecord;
}) {
  const storeRef = useRef<Store | null>(null);
  if (!storeRef.current) {
    storeRef.current = createStore(mergeRecords(initialSearchParams, urlParams));
  }

  const urlFingerprintRef = useRef<string | null>(null);
  const urlFingerprint = searchParamsFingerprint(urlParams);

  if (urlFingerprintRef.current !== urlFingerprint) {
    urlFingerprintRef.current = urlFingerprint;
    applyPatchToStoreSilent(storeRef.current, urlParams);
  }

  const getStoreSnapshot = useCallback(
    () => getSnapshot(storeRef.current!),
    [],
  );

  const params = useSyncExternalStore(
    (onStoreChange) => subscribe(storeRef.current!, onStoreChange),
    getStoreSnapshot,
    getStoreSnapshot,
  );

  const value = useMemo(
    (): SearchParamsContextValue => ({
      params,
      get: (key) => params[key],
      has: (key) => params[key] !== undefined && params[key] !== "",
      toString: () => searchParamsToQueryString(params),
    }),
    [params],
  );

  const merge = useCallback((patch: SearchParamsRecord) => {
    mergeIntoStore(storeRef.current!, patch);
  }, []);

  return (
    <SearchParamsContext.Provider value={value}>
      <SearchParamsMergeContext.Provider value={merge}>
        {children}
      </SearchParamsMergeContext.Provider>
    </SearchParamsContext.Provider>
  );
}

/**
 * Reads the URL inside Suspense and pushes params to the stable parent via
 * useLayoutEffect (before paint, no setState-during-render).
 */
function UrlSearchParamsSubscriber({
  onParams,
}: {
  onParams: (params: SearchParamsRecord) => void;
}) {
  const nextParams = useSearchParams();
  const parsed = useMemo(
    () => parseUrlSearchParams(nextParams),
    [nextParams],
  );
  const fingerprint = searchParamsFingerprint(parsed);
  const committedRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (committedRef.current === fingerprint) return;
    committedRef.current = fingerprint;
    onParams(parsed);
  }, [onParams, parsed, fingerprint]);

  return null;
}

/**
 * Global search-params store for layout/providers.
 *
 * Tree shape matches the original design: only the URL reader suspends;
 * `{children}` stay mounted under a stable provider (no remount on resolve).
 */
export function SearchParamsProvider({
  children,
  initialSearchParams,
}: {
  children: React.ReactNode;
  initialSearchParams?: SearchParamsRecord;
}) {
  const [urlParams, setUrlParams] = useState<SearchParamsRecord>(EMPTY);

  const handleUrlParams = useCallback((next: SearchParamsRecord) => {
    setUrlParams((prev) => {
      if (searchParamsFingerprint(prev) === searchParamsFingerprint(next)) {
        return prev;
      }
      return next;
    });
  }, []);

  return (
    <SearchParamsProviderInner
      initialSearchParams={initialSearchParams}
      urlParams={urlParams}
    >
      <Suspense fallback={null}>
        <UrlSearchParamsSubscriber onParams={handleUrlParams} />
      </Suspense>
      {children}
    </SearchParamsProviderInner>
  );
}

const SearchParamsMergeContext = createContext<
  ((patch: SearchParamsRecord) => void) | null
>(null);

function useMergeSearchParams(): (patch: SearchParamsRecord) => void {
  const merge = useContext(SearchParamsMergeContext);
  if (!merge) {
    throw new Error(
      "useMergeSearchParams must be used within SearchParamsProvider",
    );
  }
  return merge;
}

/**
 * Commits a params patch after render (useLayoutEffect) so we never update the
 * provider store while a sibling is still rendering.
 */
function useCommitSearchParamsToStore(params: SearchParamsRecord): void {
  const merge = useMergeSearchParams();
  const committedRef = useRef<string | null>(null);
  const fingerprint = searchParamsFingerprint(params);

  useLayoutEffect(() => {
    commitSearchParamsIfChanged(merge, params, committedRef);
  }, [merge, params, fingerprint]);
}

/**
 * Seeds the global store from server-parsed page props.
 * Use on ISR/static pages so query params are available before URL sync runs.
 */
export function RouteSearchParams({
  params,
}: {
  /** Pass `parseServerSearchParams(await searchParams)` from a Server Component page. */
  params: SearchParamsRecord;
}) {
  useCommitSearchParamsToStore(params);
  return null;
}

/**
 * @deprecated URL sync is built into SearchParamsProvider. Kept for compatibility.
 */
export function SearchParamsSync() {
  return null;
}

/**
 * True after the client has mounted. Use for query-only UI (e.g. hide header for
 * `?layout=app`) so server HTML and the first hydrated render stay identical.
 */
export function useSearchParamsHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

/** Prefer this over `useSearchParams()` in shared layout/providers. */
export function useAppSearchParams(): SearchParamsContextValue {
  const ctx = useContext(SearchParamsContext);
  if (!ctx) {
    throw new Error(
      "useAppSearchParams must be used within SearchParamsProvider",
    );
  }
  return ctx;
}

export function useAppSearchParam(key: string): string | undefined {
  return useAppSearchParams().get(key);
}

/** Resolves `?editToken=` or `?token=` from the global search-params store. */
export function useAuthToken(): string | undefined {
  const token = resolveAuthToken(
    useAppSearchParam("editToken"),
    useAppSearchParam("token"),
  );
  return token ?? undefined;
}
