import { fetchVisitUsResolvedData } from "pageEditor/data/fetchVisitUsResolvedData";
import { VisitUsSectionProps } from "../components/VisitUsSection/fields";
import { getCookie } from "@lib/cookie";
import { resolveTimezone } from "@lib/helper";

// Define the resolved data interface for visit us
interface VisitUsResolvedData {
  storeData: {
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
  } | null;
  loading: boolean;
  error: string | null;
}

// Server-side data context for VisitUsSection
export class VisitUsDataContext {
  private static instance: VisitUsDataContext;
  private dataCache: Map<string, VisitUsResolvedData> = new Map();
  private cacheTimeout: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes cache

  private constructor() {}

  static getInstance(): VisitUsDataContext {
    if (!VisitUsDataContext.instance) {
      VisitUsDataContext.instance = new VisitUsDataContext();
    }
    return VisitUsDataContext.instance;
  }

  async getResolvedData(
    coordinates: { latitude: number; longitude: number }, 
    token?: string,
    timezone?: string, // Accept timezone as parameter
    storeSlug?: string // Optional store slug to filter to specific store
  ): Promise<VisitUsResolvedData> {
    try {
      // Create a cache key based on coordinates, token, timezone, and storeSlug
      const cacheKey = JSON.stringify({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        token: token,
        timezone: resolveTimezone(timezone),
        storeSlug: storeSlug || ''
      });

      const now = Date.now();
      
      // Check if we have valid cached data
      if (this.dataCache.has(cacheKey)) {
        const cacheTime = this.cacheTimeout.get(cacheKey) || 0;
        if (now - cacheTime < this.CACHE_DURATION) {
          return this.dataCache.get(cacheKey)!;
        }
      }

      // Fetch fresh data with timezone and storeSlug
      const resolvedData = await fetchVisitUsResolvedData(coordinates, token, timezone, storeSlug);
   
      // Cache the data
      this.dataCache.set(cacheKey, resolvedData);
      this.cacheTimeout.set(cacheKey, now);
      
      return resolvedData;
    } catch (error) {

      // Return fallback data instead of throwing
      return {
        storeData: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch store data"
      };
    }
  }

  async getResolvedDataFromProps(
    props: VisitUsSectionProps, 
    token?: string,
    timezone?: string, // Accept timezone as optional parameter
    storeSlug?: string // Optional store slug to filter to specific store
  ): Promise<VisitUsResolvedData> {
    try {
      // Get coordinates: try cookies first (client-side), then props, then default
      const cookieLat = getCookie("lattitude");
      const cookieLng = getCookie("longitude");
      const cookieTimezone = getCookie("client_timezone");
      
      const latitude = cookieLat ? Number(cookieLat) : (props?.advanceSettings?.coordinates?.latitude || 0);
      const longitude = cookieLng ? Number(cookieLng) : (props?.advanceSettings?.coordinates?.longitude || 0);
      
      const coordinates = { latitude, longitude };
      // DISABLE_TIMEZONE → system/cookie; otherwise env NEXT_PUBLIC_TIME_ZONE
      const timezoneValue = resolveTimezone(
        timezone || cookieTimezone,
        'Asia/Calcutta',
      );
      return this.getResolvedData(coordinates, token, timezoneValue, storeSlug);
    } catch (error) {
      // Return fallback data instead of throwing
      return {
        storeData: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to get coordinates"
      };
    }
  }
}

// Export singleton instance
export const visitUsDataContext = VisitUsDataContext.getInstance(); 