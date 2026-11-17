"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { useAnalytics } from "@hooks/useAnalytics";
import { selectIsQrFlowActive } from "@redux/slices/qrFlowSlice";
import { DINE_IN_ANALYTICS_CONTEXT } from "@lib/analytics/dineInAnalytics";

/**
 * Component to automatically track page views on route changes
 */
export const PageViewTracker = () => {
  const pathname = usePathname();
  const searchParams = useAppSearchParams();
  const { page } = useAnalytics();
  const currentStore = useSelector(
    (state: RootState) => state.store.currentStore,
  );
  const isQrFlowActive = useSelector(selectIsQrFlowActive);
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if pathname is null or hasn't changed (e.g., only search params changed)
    if (!pathname || previousPathnameRef.current === pathname) {
      return;
    }

    // Update the ref
    previousPathnameRef.current = pathname;

    const dineInPageExtra = isQrFlowActive
      ? DINE_IN_ANALYTICS_CONTEXT
      : undefined;

    // Determine page name and category from pathname
    const getPageInfo = (
      path: string,
      qrFlow: boolean,
    ): { name: string; category: string; type: string } => {
      // QR welcome: /t/[token]
      if (qrFlow && /^\/t\/[^/]+/.test(path)) {
        return {
          name: "dine_in_welcome",
          category: "Dine-In",
          type: "dine_in_welcome",
        };
      }

      // QR checkout
      if (qrFlow && path.includes("qr-checkout")) {
        return {
          name: "dine_in_checkout",
          category: "Dine-In",
          type: "dine_in_checkout",
        };
      }

      // QR full menu
      if (qrFlow && path.includes("full-menu")) {
        return {
          name: "dine_in_menu",
          category: "Menu",
          type: "dine_in_menu",
        };
      }

      // Homepage
      if (path === "/" || path === "") {
        return {
          name: "home",
          category: "Landing",
          type: "homepage",
        };
      }

      // Store/Menu pages
      if (path.includes("/menu") || path.match(/\/[^/]+\/[^/]+$/)) {
        return {
          name: qrFlow ? "dine_in_menu" : "menu",
          category: "Menu",
          type: qrFlow ? "dine_in_menu" : "menu_page",
        };
      }

      // Product pages
      if (path.includes("/products/")) {
        return {
          name: "product",
          category: "Product",
          type: "product_detail",
        };
      }

      // Cart page
      if (path.includes("/cart")) {
        return {
          name: qrFlow ? "dine_in_cart" : "cart",
          category: "Cart",
          type: qrFlow ? "dine_in_cart" : "cart_page",
        };
      }

      // Checkout page
      if (path.includes("/checkout") || path.includes("/payment")) {
        return {
          name: "checkout",
          category: "Checkout",
          type: "checkout_page",
        };
      }

      // Orders page
      if (path.includes("/orders")) {
        return {
          name: "orders",
          category: "Orders",
          type: "orders_page",
        };
      }

      // Wishlist page
      if (path.includes("/wishlist")) {
        return {
          name: "wishlist",
          category: "Wishlist",
          type: "wishlist_page",
        };
      }

      // Profile/Account pages
      if (path.includes("/editProfile") || path.includes("/profile")) {
        return {
          name: "profile",
          category: "Account",
          type: "profile_page",
        };
      }

      // Events page
      if (path.includes("/events")) {
        return {
          name: "events",
          category: "Events",
          type: "events_page",
        };
      }

      // About us page
      if (path.includes("/about-us")) {
        return {
          name: "about-us",
          category: "Content",
          type: "about_page",
        };
      }

      // Default fallback
      return {
        name: path.replace(/^\//, "").replace(/\//g, "_") || "unknown",
        category: "Other",
        type: "page",
      };
    };

    const pageInfo = getPageInfo(pathname, isQrFlowActive);

    // Track page view with delay to ensure store data is available
    const timer = setTimeout(() => {
      const queryString = searchParams.toString();
      page(pageInfo.name, pageInfo.category, pageInfo.type, {
        // Include search params if present
        ...(queryString && { query_string: queryString }),
        // Include dine-in specific context if QR flow is active
        ...dineInPageExtra,
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams, page, currentStore, isQrFlowActive]);

  // This component doesn't render anything
  return null;
};
