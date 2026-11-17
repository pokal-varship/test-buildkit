"use client";

import { useEffect } from "react";
import { useAppSearchParams } from "@context/SearchParamsContext";
import { captureUtmAttribution } from "@lib/analytics/utm";

/**
 * Captures UTM / click-id params from the URL into a 30-day cookie
 * (first-touch + last-touch) as early as possible in the client tree.
 */
export const UtmCapture = () => {
  const searchParams = useAppSearchParams();

  useEffect(() => {
    captureUtmAttribution(searchParams.toString());
  }, [searchParams]);

  return null;
};
