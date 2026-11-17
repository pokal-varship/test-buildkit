import type { QrResolveData } from "@redux/slices/qrFlowSlice";

export function buildDineInQrResolvedParams(data: QrResolveData) {
  const locationName =
    data?.restaurant?.name?.trim() ||
    data?.storefrontName?.trim() ||
    data?.spaceName?.trim() ||
    undefined;

  return {
    table_number: String(data.tableNumber || data.displayName || ""),
    table_id: String(data.tableId || ""),
    store_id: String(data.storefrontId || ""),
    store_name: String(
      data.storefrontName || data.restaurant?.name || "",
    ),
    store_slug: data.storefrontSlug,
    location_name: locationName,
    has_existing_session: Boolean(data.sessionId),
    require_login_before_order: data.requireLoginBeforeOrder,
    auto_create_session: data.autoCreateSession,
    qr_code_is_active: data.qrCodeIsActive,
  };
}

export function classifyQrResolveError(
  err: unknown,
): { error_type: "not_found" | "timeout" | "invalid" | "unknown"; http_status?: number } {
  const httpStatus = (err as { response?: { status?: number } })?.response
    ?.status;
  const message = (
    err instanceof Error ? err.message : String(err)
  ).toLowerCase();

  if (httpStatus === 404) {
    return { error_type: "not_found", http_status: httpStatus };
  }
  if (
    message.includes("timeout") ||
    message.includes("network") ||
    httpStatus === 408
  ) {
    return { error_type: "timeout", http_status: httpStatus };
  }
  if (
    message.includes("invalid") ||
    message.includes("wrong") ||
    httpStatus === 400
  ) {
    return { error_type: "invalid", http_status: httpStatus };
  }
  return { error_type: "unknown", http_status: httpStatus };
}

export function sanitizeAnalyticsErrorMessage(err: unknown): string {
  const fromResponse = (
    err as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;
  if (typeof fromResponse === "string" && fromResponse.trim()) {
    return fromResponse.trim().slice(0, 200);
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim().slice(0, 200);
  }
  return "unknown_error";
}

export const DINE_IN_ANALYTICS_CONTEXT = {
  funnel: "dine_in",
  order_type: "dine-in",
} as const;
