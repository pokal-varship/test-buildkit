"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { setCookie } from "@lib/cookie";
import { getBrowserTimezone, resolveTimezone } from "@lib/helper";
import LocationProvider from "./LocationProvider";

export default function ConditionalLocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Always set timezone cookie on all pages (including homepage and about-us)
  useEffect(() => {
    setCookie("client_timezone", resolveTimezone(getBrowserTimezone()));
  }, []); // No dependencies - runs once on mount

  // Exclude homepage and about-us page for LocationProvider
  const shouldShowLocationProvider =
    pathname !== "/" && pathname !== "/about-us";

  if (shouldShowLocationProvider) {
    return <LocationProvider>{children}</LocationProvider>;
  }
  return <>{children}</>;
}
