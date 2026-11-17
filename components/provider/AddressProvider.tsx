"use client";
import React, { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { getTenantStore } from "@services/homePage";
import {
  setLoading,
  setError,
  setStoreData,
} from "@redux/slices/homePageSlice";
import { useParams } from "next/navigation";
import { useAppSearchParam } from "@context/SearchParamsContext";
import { setStoreAddress } from "@redux/slices/addressSlice";
import { setCurrentStore } from "@redux/slices/storeSlice";
import { Store } from "@components/type/store.types";
import { getCookie } from "@lib/cookie";
import { resolveTimezone } from "@lib/helper";

// Context to provide store data
const AddressContext = createContext<unknown | null>(null);

// Define the expected structure of the store data response
interface StoreDataResponse {
  data: Store[];
}

// Provider Component
export const AddressProvider: React.FC<{
  children: React.ReactNode;
  storePropsData: StoreDataResponse;
}> = ({ children, storePropsData }) => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.location);
  const params = useParams();
  const storeFromPath = Array.isArray(params?.storeSlug)
    ? params?.storeSlug[0]
    : params?.storeSlug;
  const storeFromQuery = useAppSearchParam("store");
  const storeSlug = storeFromPath || storeFromQuery || null;
  const fetchStoreData = async (
    storePropsData?: StoreDataResponse,
  ): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const latitude = location.latitude ?? 0;
      const longitude = location.longitude ?? 0;
      const timezone = resolveTimezone(getCookie("client_timezone"));
      const data: StoreDataResponse = storePropsData
        ? storePropsData
        : ((await getTenantStore(
            latitude,
            longitude,
            timezone,
          )) as StoreDataResponse);
      if (data.data.length > 0) {
        dispatch(setStoreData(data));
        const storeData = storeSlug
          ? data?.data?.find((store) => store.slug === storeSlug)
          : null;
        if (storeData) {
          dispatch(setStoreAddress(storeData?.address.address || ""));
          dispatch(setCurrentStore(storeData));
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch store data";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (storePropsData) {
      fetchStoreData(storePropsData);
    }
  }, [storePropsData, storeSlug]); //eslint-disable-line react-hooks/exhaustive-deps

  // Fetch store data when location changes
  useEffect(() => {
    if (storeSlug && location.latitude && !storePropsData) {
      fetchStoreData();
    }
  }, [storeSlug, location.latitude, storePropsData]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AddressContext.Provider
      value={
        {
          /* context values */
        }
      }
    >
      {children}
    </AddressContext.Provider>
  );
};

export default AddressProvider;
