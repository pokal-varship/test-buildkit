"use client";

import {
  useAppSearchParam,
  useSearchParamsHydrated,
} from "@context/SearchParamsContext";
import { useEffect, useState } from "react";

const STORAGE_KEY = "plateaway_layout_app";

function readSessionAppLayout(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * True when opened from the native app WebView (`?layout=app`).
 * Persists for the browser session so in-app navigation stays chromeless.
 *
 * Returns false on the server and on the first hydrated render so layout markup
 * matches SSR; updates after mount when the URL or session flag applies.
 */
export function useIsAppWebView(): boolean {
  const hydrated = useSearchParamsHydrated();
  const isAppFromUrl = useAppSearchParam("layout") === "app";
  const [sessionApp, setSessionApp] = useState(false);

  useEffect(() => {
    if (!isAppFromUrl) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore blocked storage
    }
    setSessionApp(true);
  }, [isAppFromUrl]);

  useEffect(() => {
    if (!hydrated) return;
    setSessionApp(readSessionAppLayout());
  }, [hydrated]);

  if (!hydrated) return false;
  return isAppFromUrl || sessionApp;
}
