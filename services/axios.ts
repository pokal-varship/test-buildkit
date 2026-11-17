import axios, {
  AxiosError,
  CancelTokenSource,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { GuestAuthResponse } from "types";
import {
  TOKEN_DATA_CACHE_KEY,
  clearGuestTokenCache,
  fetchGuestTokenServer,
  getGuestToken,
  refreshGuestToken,
  tokenCache,
} from "./guestToken";
import { getCookie, removeCookie, setCookie } from "@lib/cookie";
import { logoutSubject } from "@lib/rxSubject";
import { isBrowser } from "@lib/helper";
import { isAccessTokenExpired } from "@lib/tokenValidation";
import logger from "@lib/logger";

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    "Tenant-Id": process.env.NEXT_PUBLIC_TENANT_ID || "",
  },
});

interface RequestQueueItem {
  resolve: (value: InternalAxiosRequestConfig) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
  cancelSource: CancelTokenSource;
}

interface RequestMetadata {
  requestId: string;
  startTime: number;
  method: string;
  url: string;
  fullURL: string;
}

interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  __requestMetadata?: RequestMetadata;
  /** Set after one token refresh + retry to prevent infinite 401 loops. */
  _authRetry?: boolean;
}

const AUTH_RETRYABLE_STATUSES = new Set([401, 406]);
const FORBIDDEN_RELOAD_GUARD_KEY = "plateaway_auth_403_handled";

let requestQueue: RequestQueueItem[] = [];
let pendingRequests: Array<() => void> = [];
let guestLoginProgress = false;

/** Single-flight refresh — concurrent 401s share one refresh call. */
let refreshAccessTokenPromise: Promise<string> | null = null;

const clearAuthTokens = (): void => {
  setCookie("token", "");
  setCookie("refresh_token", "");
  removeCookie("token");
  removeCookie("refresh_token");
  clearGuestTokenCache();
};

const resolveValidAccessToken = (
  token: string | null | undefined,
): string | null => {
  if (!token || isAccessTokenExpired(token)) {
    return null;
  }
  return token;
};

const refreshAccessTokenSingleFlight = async (
  options?: { forceGuestRefresh?: boolean },
): Promise<string> => {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = performTokenRefresh(options).finally(() => {
    refreshAccessTokenPromise = null;
  });

  return refreshAccessTokenPromise;
};

const generateGuestToken = async (): Promise<string> => {
  try {
    const res = await getGuestToken();
    setCookie("clientName", res?.data?.clientName || "");
    const token = res?.data?.token;
    if (token?.refresh_token) {
      setCookie("refresh_token", token.refresh_token);
    }
    return token?.access_token || "";
  } catch (error) {
    logger.error("Error generating guest token:", error);
    return "";
  }
};

const getStoredCredentials = async (): Promise<{
  storedRefreshToken: string | null;
  clientName: string | null;
}> => {
  if (!isBrowser()) {
    return getServerSideCredentials();
  }
  return getClientSideCredentials();
};

const getServerSideCredentials = async (): Promise<{
  storedRefreshToken: string | null;
  clientName: string | null;
}> => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const storedRefreshToken = cookieStore.get("refresh_token")?.value;
  const clientName = cookieStore.get("clientName")?.value;

  if (storedRefreshToken && clientName) {
    return { storedRefreshToken, clientName };
  }

  const tokenData = JSON.parse(tokenCache.get(TOKEN_DATA_CACHE_KEY) || "{}");
  logger.debug("Token data from cache:", tokenData);

  return {
    storedRefreshToken: tokenData.refresh_token || null,
    clientName: tokenData.clientName || null,
  };
};

const getClientSideCredentials = (): {
  storedRefreshToken: string | null;
  clientName: string | null;
} => ({
  storedRefreshToken: getCookie("refresh_token"),
  clientName: getCookie("clientName"),
});

const handleMissingCredentials = async (): Promise<string> => {
  if (!isBrowser()) {
    return fetchGuestTokenServer({ forceRefresh: true });
  }
  throw new Error("No refresh token or client name available on server side");
};

const processRefreshResponse = async (
  response: GuestAuthResponse,
): Promise<string> => {
  setCookie("clientName", response?.data?.clientName || "");

  if (response?.data?.token?.access_token) {
    const { access_token, refresh_token } = response.data.token;

    setCookie("token", access_token);
    if (refresh_token) {
      setCookie("refresh_token", refresh_token);
    }

    return access_token;
  }

  throw new Error("Failed to refresh guest token");
};

const handleRefreshError = async (error: unknown): Promise<string> => {
  logger.error("Error refreshing guest token:", error);

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status === 500 || status === 401) {
      logger.info(
        `Refresh token rejected (${status}), issuing new guest token`,
      );
      return generateNewGuestSession();
    }
  }

  return "";
};

const generateNewGuestSession = async (): Promise<string> => {
  if (typeof window === "undefined") {
    return fetchGuestTokenServer({ forceRefresh: true });
  }

  const newToken = await generateGuestToken();

  if (isBrowser()) {
    logoutSubject.next();
  }

  return newToken || "";
};

const performTokenRefresh = async (options?: {
  forceGuestRefresh?: boolean;
}): Promise<string> => {
  if (options?.forceGuestRefresh) {
    return generateNewGuestSession();
  }

  try {
    const { storedRefreshToken, clientName } = await getStoredCredentials();

    if (!isBrowser()) {
      if (storedRefreshToken && clientName) {
        logger.info("SSR token refresh — forcing fresh guest token");
      }
      return fetchGuestTokenServer({ forceRefresh: true });
    }

    if (!storedRefreshToken || !clientName) {
      return handleMissingCredentials();
    }

    const response = await refreshGuestToken(storedRefreshToken, clientName);
    return processRefreshResponse(response);
  } catch (error) {
    return handleRefreshError(error);
  }
};

const handleAuthFailure = async (
  originalRequest: AuthAxiosRequestConfig,
  error: AxiosError,
): Promise<AxiosResponse> => {
  if (originalRequest._authRetry) {
    logger.warn("Auth retry exhausted for request", {
      url: originalRequest.url,
      status: error.response?.status,
    });
    clearAuthTokens();
    return Promise.reject(error);
  }

  try {
    const newToken = refreshAccessTokenPromise
      ? await refreshAccessTokenPromise
      : await refreshAccessTokenSingleFlight();

    if (!newToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    setCookie("token", newToken);

    requestQueue.forEach((reqItem) => {
      reqItem.config.headers["Authorization"] = newToken;
      (reqItem.config as AuthAxiosRequestConfig)._authRetry = true;
      reqItem.resolve(reqItem.config);
    });
    requestQueue = [];

    return retryRequestWithToken(originalRequest, newToken);
  } catch (refreshError) {
    requestQueue.forEach((reqItem) => reqItem.reject(refreshError));
    requestQueue = [];
    clearAuthTokens();
    return Promise.reject(refreshError);
  }
};

const retryRequestWithToken = (
  config: AuthAxiosRequestConfig,
  accessToken: string,
): Promise<AxiosResponse> => {
  config._authRetry = true;
  config.headers["Authorization"] = accessToken;
  return axiosClient(config);
};

const handleForbidden = (error: AxiosError): Promise<never> => {
  if (!isBrowser()) {
    clearGuestTokenCache();
    return Promise.reject(error);
  }

  if (sessionStorage.getItem(FORBIDDEN_RELOAD_GUARD_KEY)) {
    sessionStorage.removeItem(FORBIDDEN_RELOAD_GUARD_KEY);
    clearAuthTokens();
    return Promise.reject(error);
  }

  try {
    sessionStorage.setItem(FORBIDDEN_RELOAD_GUARD_KEY, "1");
    clearAuthTokens();
    logoutSubject.next();
    window.location.href = "/";
  } catch (redirectError) {
    logger.error("Error handling 403:", redirectError);
  }

  return Promise.reject(error);
};

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authConfig = config as AuthAxiosRequestConfig;
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.info(`🚀 API Request [${requestId}]:`, {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        "Content-Type": config.headers["Content-Type"],
        "Tenant-Id": config.headers["Tenant-Id"],
        Authorization: config.headers["Authorization"]
          ? "[REDACTED]"
          : "Not set",
      },
      params: config.params,
      data: config.data
        ? typeof config.data === "string"
          ? "[DATA]"
          : config.data
        : undefined,
      timestamp: new Date().toISOString(),
    });

    authConfig.__requestMetadata = {
      requestId,
      startTime,
      method: config.method?.toUpperCase() || "UNKNOWN",
      url: config.url || "",
      fullURL: `${config.baseURL || ""}${config.url || ""}`,
    };

    let accessToken: string | null = null;

    if (typeof window === "undefined") {
      const headerToken = config.headers["Authorization"] as string | undefined;
      accessToken = resolveValidAccessToken(headerToken);

      if (!accessToken) {
        if (headerToken) {
          delete config.headers["Authorization"];
        }

        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        accessToken = resolveValidAccessToken(cookieStore.get("token")?.value);

        if (!accessToken) {
          accessToken = await fetchGuestTokenServer();
        }
      }

      if (accessToken) {
        config.headers["Authorization"] = accessToken;
      }

      return config;
    }

    if (isBrowser()) {
      const headerToken = config.headers["Authorization"] as string | undefined;
      accessToken =
        resolveValidAccessToken(headerToken) ||
        resolveValidAccessToken(getCookie("token"));
    }

    if (!accessToken && !guestLoginProgress) {
      guestLoginProgress = true;
      try {
        accessToken = await generateGuestToken();

        if (accessToken) {
          setCookie("token", accessToken);
          config.headers["Authorization"] = accessToken;
        }

        requestQueue.forEach((reqItem) => {
          reqItem.config.headers["Authorization"] = `${accessToken}`;
          reqItem.resolve(reqItem.config);
        });
        requestQueue = [];
      } catch (tokenError) {
        logger.error(
          `Error fetching guest token for request [${requestId}]:`,
          tokenError,
        );
        requestQueue.forEach((reqItem) => reqItem.reject(tokenError));
        requestQueue = [];
      } finally {
        guestLoginProgress = false;
      }
    }

    if (guestLoginProgress) {
      return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
        const cancelSource = axios.CancelToken.source();
        config.cancelToken = cancelSource.token;
        requestQueue.push({ resolve, reject, config, cancelSource });
      });
    }

    if (accessToken) {
      config.headers["Authorization"] = accessToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const metadata = (response.config as AuthAxiosRequestConfig)
      .__requestMetadata;
    if (metadata) {
      const duration = Date.now() - metadata.startTime;
      logger.info(`✅ API Response [${metadata.requestId}]:`, {
        method: metadata.method,
        url: metadata.fullURL,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        responseSize: `${JSON.stringify(response.data).length} bytes`,
        timestamp: new Date().toISOString(),
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AuthAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const metadata = originalRequest.__requestMetadata;
    if (metadata) {
      const duration = Date.now() - metadata.startTime;
      logger.error(`❌ API Error [${metadata.requestId}]:`, {
        method: metadata.method,
        url: metadata.fullURL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorData: error.response?.data,
        timestamp: new Date().toISOString(),
      });
    }

    const status = error.response?.status;

    if (status === 403) {
      return handleForbidden(error);
    }

    if (status && AUTH_RETRYABLE_STATUSES.has(status)) {
      return handleAuthFailure(originalRequest, error);
    }

    return Promise.reject(error);
  },
);

/** Resets auth retry state after a successful user login. */
export const resetRefreshTokenRetryCount = (): void => {
  logger.info("Auth refresh state reset");
};

export const handleGuestLogin = async (): Promise<boolean> => {
  try {
    const accessToken = await generateGuestToken();
    if (accessToken) {
      setCookie("token", accessToken);
      resetRefreshTokenRetryCount();
    }
    pendingRequests.forEach((resolve) => resolve());
    pendingRequests = [];
    return true;
  } catch (loginError) {
    logger.error("Guest login failed:", loginError);
    return false;
  }
};

export default axiosClient;
