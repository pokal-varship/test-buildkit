"use client";

import { useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { RootState } from "@redux/store";
import { Store } from "@components/type/store.types";
import {
  trackEvent,
  identifyUser,
  groupUser,
  resetAnalytics,
} from "@lib/analytics/rudderstack";
import { useAuth } from "./useAuth";
import { getCookie } from "@lib/cookie";
import { getUtmEventProperties } from "@lib/analytics/utm";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@components/header/types";
import { getTenantConfig } from "@config/tenant.config";

/** Unified page impression event (replaces legacy `*_viewed` track events). */
export const PAGE_VIEW_EVENT = "page_view" as const;

/** Product type sent on combo-related commerce events */
export const COMBO_ANALYTICS_PRODUCT_TYPE = "COMBO" as const;

export function getComboNameFromApiResponse(
  api: { primaryProduct?: { name?: { en?: string } } } | null | undefined,
): string {
  return api?.primaryProduct?.name?.en?.trim() || "Combo";
}

// Detect platform (ios / android / windows / macos / web) from user agent
const getPlatform = (): string => {
  if (typeof window === "undefined") {
    return "web";
  }

  const ua = window.navigator.userAgent || "";
  const uaLower = ua.toLowerCase();

  if (/iphone|ipad|ipod/.test(uaLower)) {
    return "ios";
  }

  if (/android/.test(uaLower)) {
    return "android";
  }

  if (/windows/.test(uaLower)) {
    return "windows";
  }

  if (/macintosh|mac os x/.test(uaLower)) {
    return "macos";
  }

  return "web";
};

/**
 * Custom hook for RudderStack analytics
 * Provides easy access to analytics functions with automatic context
 */
export const useAnalytics = () => {
  const pathname = usePathname();
  const currentStore = useSelector(
    (state: RootState) => state.store.currentStore,
  );
  const { user, isAuthenticated, userId } = useAuth();
  const ipLocationCookie = getCookie("ip_location");
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const tenantConfig = getTenantConfig();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "";
  const lastIdentifiedUserIdRef = useRef<string | null>(null);
  const isIdentifyingInProgressRef = useRef(false);
  const platform = getPlatform();
  const channel = platform === "android" ? "App" : "Web";

  // Automatic user identification on auth changes is owned by
  // `AnalyticsProvider` (mounted in `app/layout.tsx`). The refs above are
  // retained because the manual `identify` and `reset` callbacks below use
  // them to dedupe explicit calls from components.

  /**
   * Get default page properties from store context
   */
  const getDefaultPageProperties = useCallback(
    (store?: Store | null): Record<string, unknown> => {
      let ipAddress: string | undefined;
      if (ipLocationCookie) {
        try {
          const parsed = JSON.parse(ipLocationCookie as string) as {
            ip?: string;
          };
          ipAddress = parsed.ip;
        } catch {
          ipAddress = undefined;
        }
      }

      const properties: Record<string, unknown> = {
        page_path: pathname,
        page_url:
          typeof window !== "undefined" ? window.location.href : pathname,
        ip_address: ipAddress,
        platform,
        channel,
        tenant_id: tenantId,
        store_id: currentStore?.id,
        ...getUtmEventProperties(),
      };

      if (store) {
        properties.restaurant_name = store.name;
        properties.city = store.address.city;
        properties.currency = tenantConfig.currencyCode; // Default currency, can be made configurable
        properties.store_id = store.id;
        properties.store_slug = store.slug;
      }

      return properties;
    },
    [pathname, ipLocationCookie, platform, channel, tenantId, currentStore?.id, tenantConfig.currencyCode],
  );

  /**
   * Track user action/event
   */
  const track = useCallback(
    async (eventName: string, properties?: Record<string, unknown>) => {
      try {
        // User identification is handled by `AnalyticsProvider`; do not call
        // `identifyUser` here, otherwise every tracked event would risk a
        // duplicate identify call.

        const eventProperties = {
          ...getDefaultPageProperties(),
          ...properties,
        };
        await trackEvent(eventName, eventProperties);
      } catch (error) {
        // Log errors but don't break the app
      }
    },
    [getDefaultPageProperties],
  );

  const trackPageViewByName = useCallback(
    async (pageName: string, properties?: Record<string, unknown>) => {
      try {
        await track(PAGE_VIEW_EVENT, {
          page_name: pageName,
          ...properties,
        });
      } catch {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track page view with automatic context (`page-view` + `page_name`).
   */
  const page = useCallback(
    async (
      pageName: string,
      pageCategory?: string,
      pageType?: string,
      additionalProperties?: Record<string, unknown>,
    ) => {
      await trackPageViewByName(pageName, {
        ...(pageCategory && { page_category: pageCategory }),
        ...(pageType && { page_type: pageType }),
        ...additionalProperties,
      });
    },
    [trackPageViewByName],
  );

  /**
   * Identify logged-in user (manual call - use sparingly).
   *
   * The user is automatically identified by `AnalyticsProvider` whenever the
   * authenticated `userId` changes. Use this only when you need to send
   * `additionalTraits` that the provider does not know about (e.g. a trait
   * captured during a specific flow).
   */
  const identify = useCallback(
    async (additionalTraits?: Record<string, unknown>) => {
      if (!isAuthenticated || !userId || !session?.userId) {
        return;
      }

      // Only identify if not already identified for this userId
      if (
        session.userId === lastIdentifiedUserIdRef.current &&
        !additionalTraits
      ) {
        return;
      }

      const traits = {
        email: user?.email,
        name: user?.name,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phoneNumber: user?.phoneNumber,
        ...additionalTraits,
      };

      await identifyUser(session?.userId, traits);
      lastIdentifiedUserIdRef.current = session.userId;
    },
    [isAuthenticated, session?.userId, user],
  );

  /**
   * Group user with restaurant/store
   */
  const group = useCallback(
    async (additionalTraits?: Record<string, unknown>) => {
      if (!currentStore) {
        return;
      }

      const traits = {
        restaurant_name: currentStore.name,
        city: currentStore.address.city,
        store_id: currentStore.id,
        store_slug: currentStore.slug,
        ...additionalTraits,
      };

      await groupUser(currentStore.id, traits);
    },
    [currentStore],
  );

  /**
   * Track navigation clicks (Menu, About Us, Events)
   * Only uses source and nav_item keys
   */
  const trackNavigation = useCallback(
    async (navItem: string, source?: string) => {
      try {
        const properties = {
          source: "homepage",
          nav_item: navItem,
        };
        await track("navigation_clicked", properties);
      } catch (error) {
        // Log errors but don't break the app
      }
    },
    [track],
  );

  /**
   * Track sign in clicks
   * Only uses source and section keys
   */
  const trackSignIn = useCallback(
    async (
      source?: string,
      section?: string,
      extra?: Record<string, unknown>,
    ) => {
      try {
        const properties = {
          source: source || (pathname === "/" ? "homepage" : pathname),
          section: section || "navbar",
          ...extra,
        };
        await track("signed_in_clicked", properties);
      } catch (error) {
        // Log errors but don't break the app
      }
    },
    [pathname, track],
  );

  /**
   * Track location set (auto-detected or manually entered)
   * Only uses city, state, country, and method keys
   */
  const trackLocation = useCallback(
    async (
      city: string,
      state: string,
      country: string,
      method: "auto_detect" | "manual",
    ) => {
      try {
        const properties = {
          city,
          state,
          country,
          method,
        };
        await track("location_set", properties);
      } catch (error) {
        // Log errors but don't break the app
      }
    },
    [track],
  );

  /**
   * Track breadcrumb clicks
   * Only uses from and to keys
   */
  const trackBreadcrumbClicked = useCallback(
    async (from: string, to: string) => {
      try {
        const properties = {
          from,
          to,
        };
        await track("Breadcrumb Clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track filter applied
   * Only uses filter_type and filter_value keys
   */
  const trackFilterApplied = useCallback(
    async (
      filter_type: string,
      filter_value: string,
      extra?: Record<string, unknown>,
    ) => {
      try {
        const properties = {
          filter_type,
          filter_value,
          ...extra,
        };
        await track("Filter Applied", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track view mode change (grid ↔ list)
   * Only uses view_mode key
   */
  const trackViewModeChanged = useCallback(
    async (view_mode: "grid" | "list", extra?: Record<string, unknown>) => {
      try {
        const properties = {
          view_mode,
          ...extra,
        };
        await track("View Mode Changed", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track wishlist / favourite clicked (heart icon)
   * is_wishlisted: 1 on add, 0 on remove
   */
  const trackProductWishlisted = useCallback(
    async (
      product_id: string,
      product_name: string,
      source: string,
      is_wishlisted: 0 | 1,
    ) => {
      try {
        const properties = {
          product_id,
          product_name,
          source,
          customer_id: session?.userId || userId,
          is_wishlisted,
        };
        await track("product_wishlisted", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track, session?.userId, userId],
  );

  /**
   * Track product search (navbar)
   * Only uses query and source keys
   */
  const trackProductSearched = useCallback(
    async (
      query: string,
      source: string,
      extra?: Record<string, unknown>,
    ) => {
      try {
        const properties = {
          query,
          source,
          ...extra,
        };
        await track("Product Searched", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track store change clicked
   * Only uses current_store_id and source keys
   */
  const trackStoreChangeClicked = useCallback(
    async (current_store_id: string, source: string) => {
      try {
        const properties = {
          current_store_id,
          source,
        };
        await track("Store Change Clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track product variant selection
   * Only uses product_id, variant_type, variant_value, price keys
   */
  const trackProductVariantSelected = useCallback(
    async (params: {
      product_id: string;
      variant_type: string;
      variant_value: string;
      price: number;
    }, extra?: Record<string, unknown>) => {
      try {
        const { product_id, variant_type, variant_value, price } = params;
        const properties = {
          product_id,
          variant_type,
          variant_value,
          price,
          ...extra,
        };
        await track("product_variant_selected", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track add to cart clicked
   * Only uses product_id, product_name, variant, quantity, price, total_value keys
   */
  const trackAddToCart = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      variant: Record<string, string>;
      quantity: number;
      price: number;
      total_value: number;
    }) => {
      try {
        const {
          product_id,
          product_name,
          variant,
          quantity,
          price,
          total_value,
        } = params;
        const properties = {
          product_id,
          product_name,
          variant,
          quantity,
          price,
          total_value,
        };
        await track("add_to_cart", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track cart page view
   * Only uses page_type, store_id, store_name,
   * city, currency, funnel, platform keys
   */
  const trackCartPageViewed = useCallback(
    async (params: {
      page_type: string;
      store_id: string;
      store_name: string;
      city: string;
      currency: string;
      funnel: string;
      platform: string;
    }) => {
      try {
        const {
          page_type,
          store_id,
          store_name,
          city,
          currency,
          funnel,
          platform,
        } = params;
        await trackPageViewByName("cart", {
          page_type,
          store_id,
          store_name,
          city,
          currency,
          funnel,
          platform,
        });
      } catch (error) {
        // Error handled silently
      }
    },
    [trackPageViewByName],
  );

  /**
   * Track dish/product click (before PDP / add-to-cart)
   * Only uses product_id, product_name, category_name,
   * store_id, price, currency keys
   */
  const trackProductClicked = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      category_name: string;
      store_id: string;
      price: number;
      currency: string;
      source?: string;
      funnel?: string;
      table_number?: string;
      session_id?: string;
    }) => {
      try {
        const properties = {
          ...params,
        };

        await track("product_clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track category page viewed
   * Only uses category_name, store_id, item_count keys
   */
  const trackMenuCategoryViewed = useCallback(
    async (params: {
      category_name: string;
      store_id: string;
      item_count: number;
      funnel?: string;
      table_number?: string;
      session_id?: string;
    }) => {
      try {
        await trackPageViewByName("menu_category", params);
      } catch (error) {
        // Error handled silently
      }
    },
    [trackPageViewByName],
  );

  /**
   * Track menu category clicks (Store selected / Order clicked)
   * Only uses category_name, category_type, store_id, store_name,
   * source, has_active_offer keys
   */
  const trackMenuCategory = useCallback(
    async (params: {
      category_name: string;
      category_type: string;
      store_id: string;
      store_name: string;
      source: string;
      has_active_offer: boolean;
    }) => {
      try {
        const {
          category_name,
          category_type,
          store_id,
          store_name,
          source,
          has_active_offer,
        } = params;

        const properties = {
          category_name,
          category_type,
          store_id,
          store_name,
          source,
          has_active_offer,
        };
        await track("menu_category_clicked", properties);
      } catch (error) {
        // Log errors but don't break the app
      }
    },
    [track],
  );

  /**
   * Track cart item quantity update (+ / −)
   * Only uses product_id, previous_quantity, new_quantity, action, price, cart_value keys
   */
  const trackCartItemQuantityUpdate = useCallback(
    async (params: {
      product_id: string;
      previous_quantity: number;
      new_quantity: number;
      action: "increase" | "decrease";
      price: number;
      cart_value: number;
    }) => {
      try {
        const {
          product_id,
          previous_quantity,
          new_quantity,
          action,
          price,
          cart_value,
        } = params;

        const properties = {
          product_id,
          previous_quantity,
          new_quantity,
          action,
          price,
          cart_value,
        };
        await track("cart_item_quantity_update", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track item removed from cart
   * Only uses product_id, product_name, quantity, cart_value_after_removal keys
   */
  const trackCartItemRemoved = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      quantity: number;
      cart_value_after_removal: number;
    }) => {
      try {
        const { product_id, product_name, quantity, cart_value_after_removal } =
          params;

        const properties = {
          product_id,
          product_name,
          quantity,
          cart_value_after_removal,
        };
        await track("cart_item_removed", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track order type selected (Takeaway / Delivery)
   * Only uses order_type key
   */
  const trackOrderTypeSelected = useCallback(
    async (order_type: "takeaway" | "delivery") => {
      try {
        const properties = {
          order_type,
        };
        await track("order_type_selected", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track coupon viewed
   * Only uses source key
   */
  const trackCouponViewed = useCallback(
    async (source: string) => {
      try {
        await trackPageViewByName("coupon", { source });
      } catch (error) {
        // Error handled silently
      }
    },
    [trackPageViewByName],
  );

  /**
   * Track coupon applied
   * Only uses coupon_code, discount_value, cart_value_after_discount keys
   */
  const trackCouponApplied = useCallback(
    async (params: {
      coupon_code: string;
      discount_value: number;
      cart_value_after_discount: number;
    }) => {
      try {
        const { coupon_code, discount_value, cart_value_after_discount } =
          params;

        const properties = {
          coupon_code,
          discount_value,
          cart_value_after_discount,
        };
        await track("Coupon Applied", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track checkout started (Pay Now clicked)
   * Only uses cart_value, item_count, order_type keys
   */
  const trackCheckoutStarted = useCallback(
    async (params: {
      cart_value: number;
      item_count: number;
      order_type: string;
    }) => {
      try {
        const { cart_value, item_count, order_type } = params;

        const properties = {
          cart_value,
          item_count,
          order_type,
        };
        await track("Checkout Started", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track create order clicked
   * Only uses order_type, store_id, store_name, item_count, cart_value,
   * pickup_date, pickup_time_type, has_coupon, has_instructions,
   * currency keys
   */
  const trackCreateOrderClicked = useCallback(
    async (params: {
      order_type: string;
      store_id: string;
      store_name: string;
      item_count: number;
      cart_value: number;
      pickup_date: string;
      pickup_time_type: string;
      has_coupon: boolean;
      has_instructions: boolean;
      currency: string;
    }) => {
      try {
        const {
          order_type,
          store_id,
          store_name,
          item_count,
          cart_value,
          pickup_date,
          pickup_time_type,
          has_coupon,
          has_instructions,
          currency,
        } = params;

        const properties = {
          order_type,
          store_id,
          store_name,
          item_count,
          cart_value,
          pickup_date,
          pickup_time_type,
          has_coupon,
          has_instructions,
          currency,
          channel,
        };
        await track("Create Order Clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track hero CTA click (Order Online)
   * Only uses source, section, cta_text, restaurant_name, city keys
   */
  const trackOrderOnlineClicked = useCallback(
    async (params: {
      source: string;
      section: string;
      cta_text: string;
      restaurant_name: string;
      city: string;
    }) => {
      try {
        const { source, section, cta_text, restaurant_name, city } = params;

        const properties = {
          source,
          section,
          cta_text,
          restaurant_name,
          city,
        };
        console.log("properties", properties);
        await track("order_online_clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track product detail page viewed
   * Fires `product_viewed` + `page-view` (page_name: product_detail)
   */
  const trackProductDetailPageViewed = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      page_type: string;
      store_id: string;
      store_name: string;
      category_name: string;
      city: string;
      currency: string;
      funnel: string;
      platform: string;
      base_price: number;
      rating: number;
      review_count: number;
      prep_time_minutes: number;
      is_veg: boolean;
      table_number?: string;
      session_id?: string;
    }) => {
      try {
        const { product_id, product_name, ...pageParams } = params;
        await track("product_viewed", {
          product_id,
          product_name,
          ...pageParams,
        });
        await trackPageViewByName("product_detail", params);
      } catch (error) {
        // Error handled silently
      }
    },
    [track, trackPageViewByName],
  );

  /**
   * Track popular item clicked
   * Only uses source, list_name, product_id, product_name, price, currency keys
   */
  const trackPopularItemClicked = useCallback(
    async (params: {
      source: string;
      list_name: string;
      product_id: string;
      product_name: string;
      price: number;
      currency: string;
    }) => {
      try {
        const { source, list_name, product_id, product_name, price, currency } =
          params;

        const properties = {
          source,
          list_name,
          product_id,
          product_name,
          price,
          currency,
        };
        console.log("properties", properties);
        await track("product_clicked", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /**
   * Track product customisation option selected
   * Only uses product_id, option_group, option_value, price_delta keys
   */
  const trackProductCustomisationSelected = useCallback(
    async (params: {
      product_id: string;
      option_group: string;
      option_value: string;
      price_delta: number;
    }, extra?: Record<string, unknown>) => {
      try {
        const { product_id, option_group, option_value, price_delta } = params;

        const properties = {
          product_id,
          option_group,
          option_value,
          price_delta,
          ...extra,
        };
        await track("product_customisation_selected", properties);
      } catch (error) {
        // Error handled silently
      }
    },
    [track],
  );

  /** Shared dine-in context merged into every dine-in track call */
  const withDineInContext = useCallback(
    (properties?: Record<string, unknown>): Record<string, unknown> => ({
      funnel: "dine_in",
      order_type: "dine-in",
      ...properties,
    }),
    [],
  );

  const trackPageViewByNameDineIn = useCallback(
    async (pageName: string, properties?: Record<string, unknown>) => {
      try {
        await track(
          PAGE_VIEW_EVENT,
          withDineInContext({
            page_name: pageName,
            ...properties,
          }),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInQrResolved = useCallback(
    async (params: {
      table_number: string;
      table_id: string;
      store_id: string;
      store_name: string;
      store_slug?: string;
      location_name?: string;
      has_existing_session: boolean;
      require_login_before_order?: boolean;
      auto_create_session?: boolean;
      qr_code_is_active?: boolean;
    }) => {
      try {
        await track("dine_in_qr_resolved", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInQrResolveFailed = useCallback(
    async (params: {
      error_type: "not_found" | "timeout" | "invalid" | "unknown";
      http_status?: number;
    }) => {
      try {
        await track("dine_in_qr_resolve_failed", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInWelcomeViewed = useCallback(
    async (params: {
      table_number: string;
      location_name?: string;
      store_id: string;
      store_name: string;
    }) => {
      try {
        await trackPageViewByNameDineIn("dine_in_welcome", params);
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackDineInExploreMenuClicked = useCallback(
    async (params: {
      table_number: string;
      is_logged_in: boolean;
      require_login_before_order?: boolean;
    }) => {
      try {
        await track("dine_in_explore_menu_clicked", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInSessionStarted = useCallback(
    async (params: {
      session_id: string;
      table_id: string;
      table_number: string;
      party_size: number;
      session_created_via: "get" | "post";
      store_id: string;
    }) => {
      try {
        await track("dine_in_session_started", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInSessionFailed = useCallback(
    async (params: { error_message: string; table_id?: string }) => {
      try {
        await track("dine_in_session_failed", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInAddToCart = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      variant: Record<string, string>;
      quantity: number;
      price: number;
      total_value: number;
      session_id?: string;
      ticket_id?: string;
      table_number?: string;
    }) => {
      try {
        await track(
          "add_to_cart",
          withDineInContext({ ...params }),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInCartPageViewed = useCallback(
    async (params: {
      page_type: string;
      store_id: string;
      store_name: string;
      city: string;
      currency: string;
      platform: string;
      item_count: number;
      cart_value: number;
      table_number: string;
      session_id: string;
    }) => {
      try {
        await trackPageViewByNameDineIn("dine_in_cart", params);
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackDineInCheckoutStarted = useCallback(
    async (params: {
      cart_value: number;
      item_count: number;
      session_id: string;
      table_number: string;
    }) => {
      try {
        await track(
          "Checkout Started",
          withDineInContext({
            cart_value: params.cart_value,
            item_count: params.item_count,
            order_type: "dine-in",
            session_id: params.session_id,
            table_number: params.table_number,
          }),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInSubmitToKitchen = useCallback(
    async (params: {
      store_id: string;
      store_name: string;
      item_count: number;
      cart_value: number;
      has_instructions: boolean;
      currency: string;
      session_id: string;
      ticket_id: string;
      table_number: string;
    }) => {
      try {
        await track(
          "dine_in_submit_to_kitchen_clicked",
          withDineInContext({ ...params, channel }),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext, channel],
  );

  const trackDineInActiveOrderViewed = useCallback(
    async (params: {
      session_id: string;
      table_number: string;
      store_id: string;
      store_name: string;
      item_count: number;
      cart_value: number;
      ticket_count: number;
      has_draft_ticket: boolean;
      has_submitted_tickets: boolean;
    }) => {
      try {
        await trackPageViewByNameDineIn("dine_in_active_order", params);
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackDineInPayNowClicked = useCallback(
    async (params: {
      session_id: string;
      cart_value: number;
      item_count: number;
      table_number: string;
    }) => {
      try {
        await track("dine_in_pay_now_clicked", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInPaymentMethodSelected = useCallback(
    async (params: {
      payment_method: string;
      session_id: string;
      cart_value: number;
    }) => {
      try {
        await track("dine_in_payment_method_selected", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInPaymentCompleted = useCallback(
    async (params: {
      session_id: string;
      order_id?: string;
      payment_method: string;
      cart_value: number;
      currency: string;
      table_number: string;
    }) => {
      try {
        await track("dine_in_payment_completed", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInPaymentFailed = useCallback(
    async (params: {
      session_id: string;
      payment_method: string;
      error_message: string;
      cart_value: number;
    }) => {
      try {
        await track("dine_in_payment_failed", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInTablePinPrompted = useCallback(
    async (params: { session_id: string; table_number: string }) => {
      try {
        await track("dine_in_table_pin_prompted", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInTablePinSubmitted = useCallback(
    async (params: {
      session_id: string;
      table_number: string;
      success: boolean;
      error_message?: string;
    }) => {
      try {
        await track("dine_in_table_pin_submitted", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInOrderSentViewed = useCallback(
    async (params: {
      table_number: string;
      session_id: string;
      ticket_id: string;
    }) => {
      try {
        await trackPageViewByNameDineIn("dine_in_order_sent", params);
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackDineInGoToActiveOrderClicked = useCallback(
    async (params: { table_number: string; session_id: string }) => {
      try {
        await track(
          "dine_in_go_to_active_order_clicked",
          withDineInContext(params),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInAddMoreItemsClicked = useCallback(
    async (params: { source: string; session_id: string }) => {
      try {
        await track("dine_in_add_more_items_clicked", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInCancelTicketClicked = useCallback(
    async (params: {
      session_id: string;
      ticket_id: string;
      item_count: number;
      cart_value: number;
    }) => {
      try {
        await track("dine_in_cancel_ticket_clicked", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInOrderInstructionUpdated = useCallback(
    async (params: {
      session_id: string;
      ticket_id: string;
      has_instructions: boolean;
      instruction_length: number;
    }) => {
      try {
        await track(
          "dine_in_order_instruction_updated",
          withDineInContext(params),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInTipUpdated = useCallback(
    async (params: {
      tip_amount: number;
      session_id: string;
      has_server_name: boolean;
    }) => {
      try {
        await track("dine_in_tip_updated", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInNavClicked = useCallback(
    async (params: {
      nav_item: "menu" | "orders" | "search" | "profile";
      source: string;
      has_active_order: boolean;
      session_id?: string;
    }) => {
      try {
        await track("dine_in_nav_clicked", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInSessionClosedPlaceholderViewed = useCallback(
    async (params: { source_path: string }) => {
      try {
        await trackPageViewByNameDineIn(
          "dine_in_session_closed_placeholder",
          params,
        );
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackDineInCartItemQuantityUpdate = useCallback(
    async (params: {
      product_id: string;
      previous_quantity: number;
      new_quantity: number;
      action: "increase" | "decrease";
      price: number;
      cart_value: number;
      session_id: string;
    }) => {
      try {
        await track("cart_item_quantity_update", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInCartItemRemoved = useCallback(
    async (params: {
      product_id: string;
      product_name: string;
      quantity: number;
      cart_value_after_removal: number;
      session_id: string;
    }) => {
      try {
        await track("cart_item_removed", withDineInContext(params));
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  const trackDineInPaymentSuccessModalViewed = useCallback(
    async (params: { order_id?: string; store_name: string }) => {
      try {
        await trackPageViewByNameDineIn("dine_in_payment_success_modal", params);
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByNameDineIn],
  );

  const trackComboSummaryViewed = useCallback(
    async (params: {
      combo_id: string;
      combo_name: string;
      step_count: number;
      total_value: number;
      savings?: number;
      store_id?: string;
      is_edit_from_cart?: boolean;
      funnel?: string;
      session_id?: string;
      table_number?: string;
    }) => {
      try {
        await trackPageViewByName("combo_summary", {
          ...params,
          is_combo: true,
          product_type: COMBO_ANALYTICS_PRODUCT_TYPE,
        });
      } catch {
        // Error handled silently
      }
    },
    [trackPageViewByName],
  );

  const trackComboAddToCart = useCallback(
    async (params: {
      combo_id: string;
      combo_name: string;
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
      total_value: number;
      savings?: number;
      step_count?: number;
      action: "add" | "update";
      store_id?: string;
    }) => {
      try {
        await track("add_to_cart", {
          ...params,
          variant: {},
          is_combo: true,
          product_type: COMBO_ANALYTICS_PRODUCT_TYPE,
          funnel: "order_online",
        });
      } catch {
        // Error handled silently
      }
    },
    [track],
  );

  const trackDineInComboAddToCart = useCallback(
    async (params: {
      combo_id: string;
      combo_name: string;
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
      total_value: number;
      savings?: number;
      step_count?: number;
      action: "add" | "update";
      store_id?: string;
      session_id?: string;
      table_number?: string;
      ticket_id?: string;
    }) => {
      try {
        await track(
          "add_to_cart",
          withDineInContext({
            ...params,
            variant: {},
            is_combo: true,
            product_type: COMBO_ANALYTICS_PRODUCT_TYPE,
          }),
        );
      } catch {
        // Error handled silently
      }
    },
    [track, withDineInContext],
  );

  /**
   * Reset analytics (call on logout)
   */
  const reset = useCallback(async () => {
    lastIdentifiedUserIdRef.current = null;
    isIdentifyingInProgressRef.current = false;
    await resetAnalytics();
  }, []);

  return {
    page,
    track,
    trackPageViewByName,
    trackPageViewByNameDineIn,
    trackNavigation,
    trackSignIn,
    trackLocation,
    trackBreadcrumbClicked,
    trackFilterApplied,
    trackViewModeChanged,
    trackProductWishlisted,
    trackProductSearched,
    trackStoreChangeClicked,
    trackProductVariantSelected,
    trackAddToCart,
    trackCartPageViewed,
    trackProductClicked,
    trackMenuCategoryViewed,
    trackMenuCategory,
    trackCartItemQuantityUpdate,
    trackCartItemRemoved,
    trackOrderTypeSelected,
    trackCouponViewed,
    trackCouponApplied,
    trackCheckoutStarted,
    trackCreateOrderClicked,
    trackOrderOnlineClicked,
    trackProductDetailPageViewed,
    trackPopularItemClicked,
    trackProductCustomisationSelected,
    trackDineInQrResolved,
    trackDineInQrResolveFailed,
    trackDineInWelcomeViewed,
    trackDineInExploreMenuClicked,
    trackDineInSessionStarted,
    trackDineInSessionFailed,
    trackDineInAddToCart,
    trackDineInCartPageViewed,
    trackDineInCheckoutStarted,
    trackDineInSubmitToKitchen,
    trackDineInActiveOrderViewed,
    trackDineInPayNowClicked,
    trackDineInPaymentMethodSelected,
    trackDineInPaymentCompleted,
    trackDineInPaymentFailed,
    trackDineInTablePinPrompted,
    trackDineInTablePinSubmitted,
    trackDineInOrderSentViewed,
    trackDineInGoToActiveOrderClicked,
    trackDineInAddMoreItemsClicked,
    trackDineInCancelTicketClicked,
    trackDineInOrderInstructionUpdated,
    trackDineInTipUpdated,
    trackDineInNavClicked,
    trackDineInSessionClosedPlaceholderViewed,
    trackDineInCartItemQuantityUpdate,
    trackDineInCartItemRemoved,
    trackDineInPaymentSuccessModalViewed,
    trackComboSummaryViewed,
    trackComboAddToCart,
    trackDineInComboAddToCart,
    identify,
    group,
    reset,
  };
};

export default useAnalytics;
