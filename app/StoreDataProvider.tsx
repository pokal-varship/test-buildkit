"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setStoreData,
  setLoading,
  setError,
} from "@redux/slices/homePageSlice";
import { getTenantStore } from "@services/homePage";
import { getCookie } from "@lib/cookie";
import { resolveTimezone } from "@lib/helper";
import type { Store } from "@components/type/store.types";
import { setStoreAddress } from "@redux/slices/addressSlice";
import { setCurrentStore } from "@redux/slices/storeSlice";
import {
  store as reduxStore,
  type AppDispatch,
  type RootState,
} from "@redux/store";

interface StoreDataResponse {
  data: Store[];
}

let pendingStoreDataRequest: Promise<StoreDataResponse> | null = null;

type StoreDataContextValue = {
  bootstrapStore: (storeSlug?: string) => Promise<Store | null>;
};

const StoreDataContext = createContext<StoreDataContextValue | null>(null);

export const useStoreDataBootstrap = (): StoreDataContextValue => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error(
      "useStoreDataBootstrap must be used within StoreDataProvider",
    );
  }
  return context;
};

/**
 * Client-side store data bootstrapper.
 *
 * Renders children immediately — ISR shell is always visible with zero delay.
 * Fetches getTenantStore silently in the background on mount and seeds Redux.
 * No overlay, no spinner, no blocking of any kind.
 */
const StoreDataProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch: AppDispatch = useDispatch();
  const currentStore = useSelector(
    (state: RootState) => state.store.currentStore,
  );
  const existingStoreData = useSelector(
    (state: RootState) => state.homePage.storeData,
  ) as StoreDataResponse | null;
  const mountedRef = useRef(true);

  const fetchStoreData = useCallback(async (): Promise<StoreDataResponse> => {
    const latestHomePageState = reduxStore.getState().homePage;
    const cachedStoreData =
      latestHomePageState.storeData as StoreDataResponse | null;
    if (
      latestHomePageState.lastUpdated &&
      Array.isArray(cachedStoreData?.data)
    ) {
      return cachedStoreData;
    }

    dispatch(setLoading(true));
    try {
      if (!pendingStoreDataRequest) {
        const latitude = Number(getCookie("lattitude") || 0);
        const longitude = Number(getCookie("longitude") || 0);
        const timezone = resolveTimezone(getCookie("client_timezone"));

        pendingStoreDataRequest = getTenantStore(
          latitude,
          longitude,
          timezone,
        ) as Promise<StoreDataResponse>;

        pendingStoreDataRequest = pendingStoreDataRequest.finally(() => {
          pendingStoreDataRequest = null;
        });
      }

      const data = await pendingStoreDataRequest;
      if (mountedRef.current) {
        dispatch(setStoreData(data));
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        const msg =
          err instanceof Error ? err.message : "Failed to load store data";
        dispatch(setError(msg));
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch]);

  const bootstrapStore = useCallback(
    async (storeSlug?: string): Promise<Store | null> => {
      const latestState = reduxStore.getState();
      const latestCurrentStore = latestState.store.currentStore;
      if (
        latestCurrentStore?.id &&
        (!storeSlug || latestCurrentStore.slug === storeSlug)
      ) {
        return latestCurrentStore;
      }

      if (storeSlug && currentStore?.id && currentStore.slug === storeSlug) {
        return currentStore;
      }

      if (!storeSlug && currentStore?.id) {
        return currentStore;
      }

      const latestExistingStoreData = latestState.homePage
        .storeData as StoreDataResponse | null;
      const storeData = latestExistingStoreData ?? existingStoreData;
      const hasFetchedStoreData =
        latestState.homePage.lastUpdated && Array.isArray(storeData?.data);
      const data = hasFetchedStoreData ? storeData : await fetchStoreData();
      const store = storeSlug
        ? (data?.data?.find((item) => item.slug === storeSlug) ?? null)
        : null;

      if (store) {
        dispatch(setStoreData(data));
        dispatch(setStoreAddress(store.address?.address || ""));
        dispatch(setCurrentStore(store));
      }

      return store;
    },
    [currentStore, dispatch, existingStoreData, fetchStoreData],
  );

  useEffect(() => {
    void fetchStoreData().catch(() => {
      // Error state is already written in fetchStoreData.
    });

    return () => {
      mountedRef.current = false;
    };
  }, [fetchStoreData]);

  const contextValue = useMemo(() => ({ bootstrapStore }), [bootstrapStore]);

  return (
    <StoreDataContext.Provider value={contextValue}>
      {children}
    </StoreDataContext.Provider>
  );
};

export default StoreDataProvider;
