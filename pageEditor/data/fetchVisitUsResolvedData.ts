import { getTenantStore } from "@services/homePage";
import { resolveTimezone } from "@lib/helper";

interface StoreResponse {
  data: Array<{
    slug?: string;
    name?: string;
    address?: {
      address?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
  }>;
}

interface VisitUsResolvedData {
  storeData: StoreResponse | null;
  loading: boolean;
  error: string | null;
}

export async function fetchVisitUsResolvedData(
  coordinates: { latitude: number; longitude: number }, 
  token?: string,
  timezone?: string, // Accept timezone as parameter instead of reading from cookies
  storeSlug?: string // Optional store slug to filter to specific store
): Promise<VisitUsResolvedData> {
  try {
    const { latitude, longitude } = coordinates;
    
    const timezoneValue = resolveTimezone(timezone);
    
    const storeResponse = await getTenantStore(latitude, longitude, timezoneValue, token) as StoreResponse;
    
    if (!storeResponse?.data?.length) {
      return {
        storeData: null,
        loading: false,
        error: null
      };
    }

    // If storeSlug is provided, filter to only that store
    if (storeSlug) {
      const filteredData = storeResponse.data.filter(store => store.slug === storeSlug);
      return {
        storeData: { data: filteredData },
        loading: false,
        error: null
      };
    }

    return {
      storeData: storeResponse,
      loading: false,
      error: null
    };
  } catch (error: unknown) {
    return {
      storeData: null,
      loading: false,
      error: error instanceof Error ? error.message : "Failed to fetch store data"
    };
  }
} 