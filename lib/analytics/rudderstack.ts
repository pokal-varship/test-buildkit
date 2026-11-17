/**
 * RudderStack Analytics Utility Functions
 * Provides type-safe wrappers for RudderStack analytics methods
 */

/**
 * Check if analytics is enabled
 * Check at runtime to ensure environment variable is always read fresh
 * In Next.js, NEXT_PUBLIC_ variables are available in both server and client
 */
const isAnalyticsEnabled = (): boolean => {
  // Always check at runtime, not at module load time
  const envValue = process.env.NEXT_PUBLIC_IS_ANALYTICS_ENABLED;
  // Only enable if explicitly set to "true" (case-sensitive)
  return envValue === "true";
};

// Track recent events to prevent duplicate calls within a short time window
const recentEvents = new Map<string, number>();
const DEDUPE_WINDOW_MS = 100; // Prevent duplicate events within 100ms

// Extend Window interface to include rudderanalytics
declare global {
  interface Window {
    rudderanalytics?: {
      page: (name: string, properties?: Record<string, unknown>) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
      group: (groupId: string, traits?: Record<string, unknown>) => void;
      reset: () => void;
      alias: (userId: string) => void;
      ready: (callback: () => void) => void;
      load: (writeKey: string, dataPlaneUrl: string, options?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Check if RudderStack is loaded and ready
 */
export const isRudderStackReady = (): boolean => {
  return typeof window !== "undefined" && typeof window.rudderanalytics !== "undefined";
};

/**
 * Wait for RudderStack to be ready
 */
export const waitForRudderStack = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isRudderStackReady()) {
      resolve();
      return;
    }

    if (typeof window !== "undefined" && window.rudderanalytics?.ready) {
      window.rudderanalytics.ready(() => {
        resolve();
      });
    } else {
      // Fallback: check every 100ms for up to 5 seconds
      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (isRudderStackReady() || attempts >= maxAttempts) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });
};

/**
 * Track a page view
 * @param name - Page name (e.g., "home", "product", "cart")
 * @param properties - Additional page properties
 */
export const trackPageView = async (
  name: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.page) {
    window.rudderanalytics.page(name, properties);
  }
};

/**
 * Track a user action/event
 * @param event - Event name (e.g., "signed_in_clicked", "add_to_cart")
 * @param properties - Event properties
 */
export const trackEvent = async (
  event: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  // Create a unique key for this event + properties combination
  const eventKey = `${event}_${JSON.stringify(properties || {})}`;
  const now = Date.now();
  
  // Check if this exact event was called recently
  const lastCallTime = recentEvents.get(eventKey);
  if (lastCallTime && now - lastCallTime < DEDUPE_WINDOW_MS) {
    // Skip duplicate call within dedupe window
    return;
  }
  
  // Record this event call
  recentEvents.set(eventKey, now);
  
  // Clean up old entries (keep map size manageable)
  if (recentEvents.size > 1000) {
    const cutoff = now - DEDUPE_WINDOW_MS * 10;
    for (const [key, time] of recentEvents.entries()) {
      if (time < cutoff) {
        recentEvents.delete(key);
      }
    }
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.track) {
    window.rudderanalytics.track(event, properties);
  }
};

/**
 * Identify a logged-in user
 * @param userId - User ID
 * @param traits - User traits (name, email, etc.)
 */
export const identifyUser = async (
  userId: string,
  traits?: Record<string, unknown>
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.identify) {
    window.rudderanalytics.identify(userId, traits);
  }
};

/**
 * Group user with restaurant/branch/organization
 * @param groupId - Group ID (e.g., restaurant ID, branch ID)
 * @param traits - Group traits (name, city, etc.)
 */
export const groupUser = async (
  groupId: string,
  traits?: Record<string, unknown>
): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.group) {
    window.rudderanalytics.group(groupId, traits);
  }
};

/**
 * Reset user session (on logout)
 */
export const resetAnalytics = async (): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.reset) {
    window.rudderanalytics.reset();
  }
};

/**
 * Alias user ID (for merging anonymous and identified users)
 * @param userId - New user ID
 */
export const aliasUser = async (userId: string): Promise<void> => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  await waitForRudderStack();
  
  if (isRudderStackReady() && window.rudderanalytics?.alias) {
    window.rudderanalytics.alias(userId);
  }
};

