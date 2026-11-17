/** Order id from checkout API (`orderId` or `id`). */
export const getPlacedOrderId = (
  data: Record<string, unknown> | undefined | null
): string => {
  if (!data) return "";
  const raw = data.orderId ?? data.id ?? data.order_id;
  return typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
};

export const isCashPaymentMethod = (method: string) =>
  method === "CASH" || method === "PayByCash";

export const isCheckoutOrderSuccess = (message: string | undefined): boolean => {
  if (!message) return false;
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "success" ||
    normalized === "order created" ||
    normalized.includes("successfully completed")
  );
};
