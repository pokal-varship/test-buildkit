import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  GUEST_AUTH_ENDPOINT,
  REFRESH_TOKEN_AUTH_ENDPOINT,
} from "@config/api.config";
import { GuestAuthResponse } from "types";
import axios from "axios";
import { LRUCache } from "lru-cache";
import {
  getAccessTokenCacheTtlMs,
  isAccessTokenExpired,
} from "@lib/tokenValidation";
import logger from "../lib/logger";

// Call tracking for getGuestToken function
interface CallMetrics {
  totalCalls: number;
  uniqueFingerprints: Set<string>;
  lastCallTimestamp: number;
  callHistory: Array<{
    timestamp: number;
    fingerprintId: string;
    duration?: number;
    success: boolean;
    error?: string;
  }>;
}

// Initialize call tracking
const guestTokenMetrics: CallMetrics = {
  totalCalls: 0,
  uniqueFingerprints: new Set(),
  lastCallTimestamp: 0,
  callHistory: [],
};

// Helper function to generate unique call ID (kept for potential future use)
// const generateCallId = (): string => {
//   return Math.random().toString(36).substr(2, 9);
// };

export const getGuestToken = async (): Promise<GuestAuthResponse> => {
  const startTime = Date.now();
  let fingerprintId = "next-server";
  
  // Increment total calls counter
  guestTokenMetrics.totalCalls++;
  guestTokenMetrics.lastCallTimestamp = startTime;
  
  logger.info(`🚀 [getGuestToken] Call #${guestTokenMetrics.totalCalls} started`, {
    totalCallsToDate: guestTokenMetrics.totalCalls,
  });

  try {
    if (typeof window !== "undefined") {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      fingerprintId = result.visitorId;
      
    }

    // Track unique fingerprints
    const isNewFingerprint = !guestTokenMetrics.uniqueFingerprints.has(fingerprintId);
    if (isNewFingerprint) {
      guestTokenMetrics.uniqueFingerprints.add(fingerprintId);
    }

    const response = await authenticateGuest(fingerprintId);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log successful completion
    logger.info(`✅ [getGuestToken] Call completed successfully`, {
      totalCallsToDate: guestTokenMetrics.totalCalls,
      hasToken: !!response?.data?.token?.access_token,
    });

    // Record call in history
    guestTokenMetrics.callHistory.push({
      timestamp: startTime,
      fingerprintId,
      duration,
      success: true,
    });

    // Keep only last 50 calls in history to prevent memory issues
    if (guestTokenMetrics.callHistory.length > 50) {
      guestTokenMetrics.callHistory = guestTokenMetrics.callHistory.slice(-50);
    }

    return {
      ...response,
      fingerPrintId: fingerprintId,
      token: response?.data?.token?.access_token,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`❌ [getGuestToken] Call failed`, {
      error: errorMessage,
      totalCallsToDate: guestTokenMetrics.totalCalls,
    });

    // Record failed call in history
    guestTokenMetrics.callHistory.push({
      timestamp: startTime,
      fingerprintId,
      duration,
      success: false,
      error: errorMessage,
    });

    // Keep only last 50 calls in history
    if (guestTokenMetrics.callHistory.length > 50) {
      guestTokenMetrics.callHistory = guestTokenMetrics.callHistory.slice(-50);
    }

    throw error;
  }
};

const authenticateGuest = async (
  fingerprintId: string
): Promise<GuestAuthResponse> => {
  

  try {
    const response = await axios.post(
      GUEST_AUTH_ENDPOINT,
      {
        fingerprintId,
      },
      {
        baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
        headers: {
          "Tenant-Id": process.env.NEXT_PUBLIC_TENANT_ID || "",
          "X-Auth-Origin": process.env.NEXT_PUBLIC_WEBSITE_URL || "",
        },
      }
    );
    
    
    return response.data;
  } catch (error) {
    
    logger.error(`❌ [authenticateGuest] Authentication failed`, {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    throw error;
  }
};

export const refreshGuestToken = async (
  refreshToken: string,
  ClientName: string
): Promise<GuestAuthResponse> => {
  try {

    const response = await axios.get(REFRESH_TOKEN_AUTH_ENDPOINT, {
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
      headers: {
        ClientName,
        Authorization: refreshToken,
      },
    });
    return response.data;
  } catch (error) {

    throw error;
  }
};

// Configure the LRU cache for server-side token caching.
// Per-entry TTL is set from JWT expiry when tokens are stored; this is the upper bound.
export const tokenCache = new LRUCache<string, string>({
  max: 10,
  ttl: 86_400_000, // 24 hours max — individual entries use JWT-derived TTL
});

// The cache key for our guest token
const GUEST_TOKEN_CACHE_KEY = "global_guest_token";
export const TOKEN_DATA_CACHE_KEY = "token_data";
const GUEST_TOKEN_PENDING_KEY = "guest_token_pending";

export interface FetchGuestTokenOptions {
  /** Bypass cache and fetch a fresh guest token from the API. */
  forceRefresh?: boolean;
}

/** Removes all cached guest token state (used on forced refresh / auth errors). */
export function clearGuestTokenCache(): void {
  tokenCache.delete(GUEST_TOKEN_CACHE_KEY);
  tokenCache.delete(TOKEN_DATA_CACHE_KEY);
  tokenCache.delete(GUEST_TOKEN_PENDING_KEY);
}

function getValidCachedAccessToken(): string | null {
  const cachedToken = tokenCache.get(GUEST_TOKEN_CACHE_KEY);
  const tokenDataRaw = tokenCache.get(TOKEN_DATA_CACHE_KEY);

  if (!cachedToken && !tokenDataRaw) {
    return null;
  }

  try {
    const tokenData = JSON.parse(tokenDataRaw || "{}");
    const accessToken = tokenData?.access_token || cachedToken;

    if (accessToken && !isAccessTokenExpired(accessToken)) {
      return accessToken;
    }
  } catch {
    // Invalid cache payload — fall through to clear
  }

  clearGuestTokenCache();
  return null;
}

function cacheGuestTokenResponse(res: GuestAuthResponse): string {
  const newToken = res?.data?.token?.access_token;
  if (!newToken) {
    throw new Error("No token received from authentication");
  }

  const expiresInSec = res?.data?.expires_in;
  const fallbackMs = expiresInSec ? expiresInSec * 1000 : 3_600_000;
  const cacheTtlMs = getAccessTokenCacheTtlMs(newToken, fallbackMs);

  const tokenPayload = {
    ...(res?.data?.token || {}),
    clientName: res?.data?.clientName,
  };

  tokenCache.set(GUEST_TOKEN_CACHE_KEY, newToken, { ttl: cacheTtlMs });
  tokenCache.set(TOKEN_DATA_CACHE_KEY, JSON.stringify(tokenPayload), {
    ttl: cacheTtlMs,
  });
  tokenCache.delete(GUEST_TOKEN_PENDING_KEY);

  return newToken;
}

// Store for ongoing authentication promises to prevent concurrent API calls
let ongoingAuthPromise: Promise<string> | null = null;

export async function fetchGuestTokenServer(
  options?: FetchGuestTokenOptions,
): Promise<string> {
  try {
    if (options?.forceRefresh) {
      clearGuestTokenCache();
    } else {
      const cachedToken = getValidCachedAccessToken();
      if (cachedToken) {
        return cachedToken;
      }
    }

    // Check if there's already an ongoing authentication request
    if (ongoingAuthPromise) {
      try {
        const result = await ongoingAuthPromise;
        if (result && !isAccessTokenExpired(result)) {
          return result;
        }
        clearGuestTokenCache();
      } catch {
        ongoingAuthPromise = null;
      }
    }

    ongoingAuthPromise = (async (): Promise<string> => {
      try {
        tokenCache.set(GUEST_TOKEN_PENDING_KEY, "true", { ttl: 30_000 });

        const res = await getGuestToken();
        const newToken = cacheGuestTokenResponse(res);

        logger.info(`✅ [fetchGuestTokenServer] New token fetched and cached`);
        return newToken;
      } catch (error) {
        tokenCache.delete(GUEST_TOKEN_PENDING_KEY);
        throw error;
      } finally {
        ongoingAuthPromise = null;
      }
    })();

    return await ongoingAuthPromise;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.error(`❌ [fetchGuestTokenServer] Server token request failed`, {
      error: errorMessage,
    });

    tokenCache.delete(GUEST_TOKEN_PENDING_KEY);
    ongoingAuthPromise = null;

    return "";
  }
}

// Utility functions to access guest token metrics
export const getGuestTokenMetrics = () => {
  return {
    totalCalls: guestTokenMetrics.totalCalls,
    uniqueFingerprintsCount: guestTokenMetrics.uniqueFingerprints.size,
    lastCallTimestamp: guestTokenMetrics.lastCallTimestamp,
    lastCallTime: guestTokenMetrics.lastCallTimestamp ? new Date(guestTokenMetrics.lastCallTimestamp).toISOString() : null,
    callHistoryCount: guestTokenMetrics.callHistory.length,
    successfulCalls: guestTokenMetrics.callHistory.filter(call => call.success).length,
    failedCalls: guestTokenMetrics.callHistory.filter(call => !call.success).length,
    averageDuration: guestTokenMetrics.callHistory.length > 0 
      ? Math.round(guestTokenMetrics.callHistory.reduce((sum, call) => sum + (call.duration || 0), 0) / guestTokenMetrics.callHistory.length)
      : 0,
    hasOngoingRequest: !!ongoingAuthPromise,
    isPendingInCache: !!tokenCache.get(GUEST_TOKEN_PENDING_KEY),
  };
};

// Function to check if there's an ongoing authentication request
export const hasOngoingGuestTokenRequest = (): boolean => {
  return !!ongoingAuthPromise || !!tokenCache.get(GUEST_TOKEN_PENDING_KEY);
};

// Function to get current cache status
export const getGuestTokenCacheStatus = () => {
  return {
    hasToken: !!tokenCache.get(GUEST_TOKEN_CACHE_KEY),
    hasTokenData: !!tokenCache.get(TOKEN_DATA_CACHE_KEY),
    isPending: !!tokenCache.get(GUEST_TOKEN_PENDING_KEY),
    hasOngoingPromise: !!ongoingAuthPromise,
    cacheSize: tokenCache.size,
    cacheKeys: Array.from(tokenCache.keys()),
  };
};

// Function to log current metrics summary
export const logGuestTokenMetricsSummary = () => {
  const metrics = getGuestTokenMetrics();
  const cacheStatus = getGuestTokenCacheStatus();
  
  logger.info(`📊 [getGuestToken] Metrics Summary`, {
    totalCalls: metrics.totalCalls,
    successfulCalls: metrics.successfulCalls,
    failedCalls: metrics.failedCalls,
    successRate: metrics.totalCalls > 0 
      ? `${Math.round((metrics.successfulCalls / (metrics.successfulCalls + metrics.failedCalls)) * 100)}%`
      : '0%',
  });
  
  return { metrics, cacheStatus };
};

// Function to reset metrics (useful for testing or periodic resets)
export const resetGuestTokenMetrics = () => {
  guestTokenMetrics.totalCalls = 0;
  guestTokenMetrics.uniqueFingerprints.clear();
  guestTokenMetrics.lastCallTimestamp = 0;
  guestTokenMetrics.callHistory = [];
  
  logger.info(`🔄 [getGuestToken] Metrics reset`);
};
