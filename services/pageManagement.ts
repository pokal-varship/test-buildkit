import { PAGES_ENDPOINT, PAGES_SLUGS_ENDPOINT } from '@config/api.config';
import { Data } from '@measured/puck';
import axiosClient from './axios';
import { pageDraftCache, pageDraftNoContentCache } from '../utils/cache';

/**
* Service for managing page content through external API
*/

interface PageData {
  data: Data['content']; // Use Puck Data content type
  pageSlug: string;
  isDraft: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface GetPageResponse extends Record<string, unknown> {
  success: boolean;
  data?: Data; // Use Puck Data type
  isDraft?: boolean;
  /** True when GET /pages returned 204 — page slug exists but has no saved content yet */
  isNewPage?: boolean;
  error?: string;
}

export const toApiPageSlug = (pageSlug: string): string =>
  pageSlug === "/" ? "home" : pageSlug.replace(/^\//, "");

/** Builds PATCH /pages body from Puck editor data */
export const buildPagePublishPayload = (
  data: Data,
  pagePath: string,
  isDraft: boolean,
): PageData => ({
  data: data.content || [],
  pageSlug: toApiPageSlug(pagePath),
  isDraft,
});

/** Editor URL for a page path (e.g. `/edit`, `/about-us/edit`) */
export const buildEditorUrl = (
  pagePath: string,
  options?: {
    editToken?: string | null;
    authToken?: string | null;
    isDraft?: boolean;
  },
): string => {
  const normalizedPath =
    pagePath === "/" || pagePath === "" ? "/" : pagePath.replace(/\/$/, "");
  const editPath = normalizedPath === "/" ? "/edit" : `${normalizedPath}/edit`;
  const params = new URLSearchParams();

  const authToken = options?.authToken ?? options?.editToken;
  if (authToken) {
    params.set("editToken", authToken);
  }
  if (options?.isDraft === false) {
    params.set("isDraft", "false");
  } else if (options?.isDraft === true) {
    params.set("isDraft", "true");
  }

  const query = params.toString();
  return query ? `${editPath}?${query}` : editPath;
};

export interface PublishDraftToLiveResult extends ApiResponse {
  draftRemoved?: boolean;
}

export interface PublishDraftToLiveOptions {
  /** Skip DELETE draft — use when publishing live for the first time (no draft on API yet). */
  skipDraftDelete?: boolean;
}

/**
 * Publishes draft content live, then removes the draft copy from the API.
 */
export const publishDraftToLive = async (
  data: Data,
  pagePath: string,
  token?: string | null,
  options?: PublishDraftToLiveOptions,
): Promise<PublishDraftToLiveResult> => {
  const publishResult = await publishPageDraft(data, pagePath, false, token);
  if (!publishResult.success) {
    return publishResult;
  }

  if (options?.skipDraftDelete) {
    invalidateAdminPageListsCache(token ?? undefined);
    return {
      success: true,
      message: publishResult.message,
      draftRemoved: false,
    };
  }

  const deleteResult = await deletePage(pagePath, true, token);
  if (deleteResult.success) {
    invalidateAdminPageListsCache(token ?? undefined);
    return {
      success: true,
      message: publishResult.message,
      draftRemoved: true,
    };
  }

  return {
    success: true,
    message: publishResult.message,
    draftRemoved: false,
    error: deleteResult.error,
  };
};

const normalizeAuthToken = (token?: string | null): string | undefined => {
  if (!token?.trim()) return undefined;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const parsePagesApiResponse = (response: {
  status: number;
  data?: {
    data?: {
      data?: Data["content"];
      root?: Data["root"];
      isDraft?: boolean;
    };
  };
}): GetPageResponse => {
  if (response.status === 204) {
    return {
      success: false,
      isNewPage: true,
      isDraft: true,
      error: "No page data found",
    };
  }

  const pagePayload = response.data?.data;
  const content = pagePayload?.data;

  if (response.status === 200 && Array.isArray(content)) {
    return {
      success: true,
      data: {
        content,
        root: pagePayload?.root || {},
      },
      isDraft: pagePayload?.isDraft === true,
    };
  }

  return { success: false, error: "No page data found" };
};

/**
* Publishes page draft to external API
* @param data - Puck data object
* @param pagePath - Page path (e.g. '/', '/about-us')
* @param isDraft - true to save draft, false to publish live
* @param token - Admin editToken from URL (`?token=` / `?editToken=`)
* @returns Promise<ApiResponse>
*/
export const publishPageDraft = async (
  data: Data,
  pagePath: string,
  isDraft = true,
  token?: string | null,
): Promise<ApiResponse> => {
  try {
    const transformedData = buildPagePublishPayload(data, pagePath, isDraft);

    console.log('[publishPageDraft] Payload:', {
      pageSlug: transformedData.pageSlug,
      isDraft: transformedData.isDraft,
      contentLength: transformedData.data?.length,
      contentTypes: Array.isArray(transformedData.data) ? transformedData.data.map((item: Record<string, unknown>) => item?.type) : 'not-array',
      dataKeys: Object.keys(data),
      rawContentLength: data?.content?.length,
    });

    const response = await axiosClient.patch(PAGES_ENDPOINT, transformedData, {
      headers: {
        ...(token && { Authorization: normalizeAuthToken(token) }),
      },
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    });

    const result = {
      success: true,
      message: response?.data?.message || 'Draft published successfully',
    };

    if (!isDraft) {
      void requestPublishedPageRevalidation(pagePath, token);
    }

    return result;
  } catch (error: unknown) {
    // Handle axios error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string }; statusText?: string } };
      if (axiosError.response) {
        return {
          success: false,
          error: `API Error (${axiosError.response.status}): ${axiosError.response.data?.message || axiosError.response.statusText}`
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Map to store pending requests for deduplication
const pendingPageDraftRequests = new Map<string, Promise<GetPageResponse>>();

/**
* Creates a cache key for page draft requests.
* 
* @param {string} pageSlug - The page slug.
* @returns {string} The cache key.
*/
const createPageDraftRequestKey = (pageSlug: string, isDraft: boolean): string => {
    const slug = pageSlug === '/' ? 'home' : pageSlug.replace('/', '');
    return `${isDraft ? 'draft' : 'published'}-${slug}`;
};

/** Clears in-memory published page cache (used after live publish + ISR revalidation). */
export const invalidatePublishedPageDataCache = (pagePath: string): void => {
  const cacheKey = createPageDraftRequestKey(pagePath, false);
  pageDraftCache.delete(cacheKey);
  pageDraftNoContentCache.delete(cacheKey);
  pendingPageDraftRequests.delete(cacheKey);
  pendingPageDraftRequests.delete(`${cacheKey}:url-token`);
};

/**
 * Triggers Next.js ISR revalidation for supported live-published pages (homepage today).
 */
export const requestPublishedPageRevalidation = async (
  pagePath: string,
  token?: string | null,
): Promise<{ success: boolean; skipped?: boolean }> => {
  const normalizedPath =
    pagePath === "" || pagePath === "/" ? "/" : pagePath;

  if (normalizedPath !== "/") {
    return { success: true, skipped: true };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authToken = normalizeAuthToken(token);
    if (authToken) {
      headers.Authorization = authToken;
    }

    const response = await fetch("/api/pages/revalidate", {
      method: "POST",
      headers,
      body: JSON.stringify({ pagePath: normalizedPath }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = (await response.json()) as {
      success?: boolean;
      skipped?: boolean;
    };
    return { success: data.success === true, skipped: data.skipped };
  } catch {
    return { success: false };
  }
};

/**
* Fetches page draft data from external API (Server-side)
* Uses LRU cache with request deduplication to prevent continuous API calls
* @param pageSlug - Page slug (e.g., 'home', 'about-us')
* @param token - Optional authorization token (if not provided, axiosClient interceptor will handle it)
* @returns Promise<GetPageResponse>
*/
export const getPageDraft = async (
  pageSlug: string,
  token?: string,
  isDraft=true // true for draft, false for live data (default is draft)      
): Promise<GetPageResponse> => {
  // Create cache key based on pageSlug and draft/published mode (token not needed for caching)
  const cacheKey = createPageDraftRequestKey(pageSlug, isDraft);
  // URL-provided tokens (e.g. /edit?token=Bearer …) must not read/write slug-only cache,
  // otherwise a prior guest 204 can block loading real drafts for the same page.
  const skipCache = Boolean(token?.trim());
  const pendingKey = skipCache ? `${cacheKey}:url-token` : cacheKey;

  try {
    if (!skipCache) {
      // Check if data exists in cache first (check both regular and no-content cache)
      const cachedData = pageDraftCache.get(cacheKey) || pageDraftNoContentCache.get(cacheKey);
      if (cachedData) {
        return {
          success: cachedData.success as boolean,
          data: cachedData.data,
          error: cachedData.error as string | undefined
        } as GetPageResponse;
      }
    }

    // Check if there's already a pending request for the same parameters
    const existingRequest = pendingPageDraftRequests.get(pendingKey);
    if (existingRequest) {
      // Wait for the existing request to complete and return its result
      return await existingRequest;
    }

    // Create new request promise
    const requestPromise = (async (): Promise<GetPageResponse> => {
      try {
        // Transform pageSlug for API call
        const slug = toApiPageSlug(pageSlug);
        // Make API call with token in headers if provided
        const response = await axiosClient.get(PAGES_ENDPOINT, {
          params: {
            pageSlug: slug,
            isDraft: isDraft,
          },
          headers: {
            ...(token && { Authorization: normalizeAuthToken(token) }),
          },
          // Use external API base URL if different from default axiosClient baseURL
          baseURL: process.env.NEXT_PUBLIC_API_URL || ''
        });

        const result = parsePagesApiResponse(response);

        if (response.status === 204) {
          if (!skipCache) {
            pageDraftNoContentCache.set(cacheKey, result as Record<string, unknown>);
          }
          return result;
        }

        if (result.success && !skipCache) {
          pageDraftCache.set(cacheKey, result as Record<string, unknown>);
        } else if (!skipCache) {
          pageDraftCache.set(cacheKey, result as Record<string, unknown>);
        }

        return result;
      } catch (error: unknown) {
        // Handle axios error response
        let result: GetPageResponse;
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: { message?: string }; statusText?: string } };
          if (axiosError.response) {
            result = {
              success: false,
              error: `API Error (${axiosError.response.status}): ${axiosError.response.data?.message || axiosError.response.statusText}`
            };
          } else {
            result = {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
          }
        } else {
          result = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
        return result;
      } finally {
        // Always remove the pending request when done (success or failure)
        pendingPageDraftRequests.delete(pendingKey);
      }
    })();

    // Store the pending request
    pendingPageDraftRequests.set(pendingKey, requestPromise);

    // Return the promise result
    return await requestPromise;
  } catch (error) {
    // Ensure pending request is cleaned up on error
    pendingPageDraftRequests.delete(pendingKey);
    throw error;
  }
};

export interface PageSlugItem {
  id: string;
  pageSlug: string;
  title?: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface PageSlugsResponse {
  success: boolean;
  items: PageSlugItem[];
  error?: string;
}

const pendingPageSlugsRequests = new Map<string, Promise<PageSlugsResponse>>();

const createPageSlugsRequestKey = (
  isDraft: boolean,
  token: string,
): string => `${isDraft ? "draft" : "published"}:${token.trim()}`;

export interface AdminPageListsResult {
  published: PageSlugsResponse;
  draft: PageSlugsResponse;
}

let activeAdminPageListsFetch: {
  token: string;
  promise: Promise<AdminPageListsResult>;
} | null = null;

const adminPageListsCache = new Map<
  string,
  { result: AdminPageListsResult; fetchedAt: number }
>();

const ADMIN_PAGE_LISTS_CACHE_MS = 30_000;

/**
 * Fetches page slugs for admin list (published or draft).
 * Requires a validated admin token.
 */
export const getPageSlugs = async (
  isDraft: boolean,
  token: string,
): Promise<PageSlugsResponse> => {
  const pendingKey = createPageSlugsRequestKey(isDraft, token);
  const existingRequest = pendingPageSlugsRequests.get(pendingKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = (async (): Promise<PageSlugsResponse> => {
    try {
      const response = await axiosClient.get(PAGES_SLUGS_ENDPOINT, {
        params: { isDraft },
        headers: {
          Authorization: normalizeAuthToken(token),
        },
        baseURL: process.env.NEXT_PUBLIC_API_URL || "",
      });

      const items = response.data?.data;
      if (Array.isArray(items)) {
        return { success: true, items };
      }

      return { success: true, items: [] };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string }; statusText?: string };
        };
        if (axiosError.response) {
          return {
            success: false,
            items: [],
            error: `API Error (${axiosError.response.status}): ${axiosError.response.data?.message || axiosError.response.statusText}`,
          };
        }
      }

      return {
        success: false,
        items: [],
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      pendingPageSlugsRequests.delete(pendingKey);
    }
  })();

  pendingPageSlugsRequests.set(pendingKey, requestPromise);
  return requestPromise;
};

/**
 * Loads published + draft slug lists for admin in one deduplicated operation.
 */
export const fetchAdminPageLists = async (
  token: string,
  options?: { force?: boolean },
): Promise<AdminPageListsResult> => {
  if (!options?.force) {
    const cached = adminPageListsCache.get(token);
    if (cached && Date.now() - cached.fetchedAt < ADMIN_PAGE_LISTS_CACHE_MS) {
      return cached.result;
    }

    if (activeAdminPageListsFetch?.token === token) {
      return activeAdminPageListsFetch.promise;
    }
  }

  const promise = Promise.all([
    getPageSlugs(false, token),
    getPageSlugs(true, token),
  ]).then(([published, draft]) => {
    const result = { published, draft };
    adminPageListsCache.set(token, { result, fetchedAt: Date.now() });
    return result;
  });

  activeAdminPageListsFetch = { token, promise };

  try {
    return await promise;
  } finally {
    if (activeAdminPageListsFetch?.promise === promise) {
      activeAdminPageListsFetch = null;
    }
  }
};

export const invalidateAdminPageListsCache = (token?: string): void => {
  if (token) {
    adminPageListsCache.delete(token);
    return;
  }
  adminPageListsCache.clear();
};

/**
 * Deletes a page from external API (draft or published)
 * @param pageSlug - Page slug or path (e.g. 'home', '/', '/about-us')
 * @param isDraft - true to delete draft, false to delete published
 * @param token - Optional editToken from admin URL
 */
export const deletePage = async (
  pageSlug: string,
  isDraft: boolean,
  token?: string | null,
): Promise<ApiResponse> => {
  try {
    const slug = toApiPageSlug(pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`);

    const response = await axiosClient.delete(PAGES_ENDPOINT, {
      data: {
        pageSlug: slug,
        isDraft,
      },
      headers: {
        ...(token && { Authorization: normalizeAuthToken(token) }),
      },
      baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    });

    const cacheKey = createPageDraftRequestKey(
      slug === "home" ? "/" : `/${slug}`,
      isDraft,
    );
    pageDraftCache.delete(cacheKey);
    pageDraftNoContentCache.delete(cacheKey);

    return {
      success: true,
      message: response?.data?.message || "Page deleted successfully",
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string }; statusText?: string };
      };
      if (axiosError.response) {
        return {
          success: false,
          error: `API Error (${axiosError.response.status}): ${axiosError.response.data?.message || axiosError.response.statusText}`,
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getPageDraftClient = async (
  pageSlug: string,
  isDraft = true,
  token?: string | null,
): Promise<GetPageResponse> => {
  try {
    const slug = toApiPageSlug(pageSlug);

    const response = await axiosClient.get(PAGES_ENDPOINT, {
      params: {
        pageSlug: slug,
        isDraft: isDraft,
      },
      headers: {
        ...(token && { Authorization: normalizeAuthToken(token) }),
      },
      baseURL: process.env.NEXT_PUBLIC_API_URL || ''
    });

    return parsePagesApiResponse(response);
  } catch (error: unknown) {
    // Handle axios error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string }; statusText?: string } };
      if (axiosError.response) {
        return {
          success: false,
          error: `API Error (${axiosError.response.status}): ${axiosError.response.data?.message || axiosError.response.statusText}`
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

 