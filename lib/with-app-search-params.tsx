"use client";

import {
  useAppSearchParams,
  type SearchParamsContextValue,
} from "@context/SearchParamsContext";
import type { ComponentType } from "react";

/**
 * Client HOC: injects `appSearchParams` so children avoid calling useSearchParams()
 * (and stay compatible with the global provider + ISR shell).
 *
 * Prefer `useAppSearchParam('key')` in new code; use this when wrapping legacy components.
 */
export function withAppSearchParams<Props extends object>(
  Component: ComponentType<
    Props & { appSearchParams: SearchParamsContextValue }
  >,
) {
  function WithAppSearchParams(props: Props) {
    const appSearchParams = useAppSearchParams();
    return <Component {...props} appSearchParams={appSearchParams} />;
  }

  const name = Component.displayName || Component.name || "Component";
  WithAppSearchParams.displayName = `withAppSearchParams(${name})`;

  return WithAppSearchParams;
}
