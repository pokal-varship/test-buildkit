import { Order } from "@components/type/order.type";
import { parseOrderIdFromDetailStatusTopic } from "@config/isometrikMqtt.config";

const SUPPORTED_EVENT_TYPES = new Set([
  "ORDER_LISTING_STATUS_UPDATED",
  "ORDER_STATUS_UPDATED",
]);

type OrderMqttPatch = {
  orderId: string;
  eventType?: string;
  status?: string;
  statusUpdatedAt?: number;
  orderData?: Partial<Order>;
};

function pickString(
  source: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(
  source: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function mapMqttOrderData(data: Record<string, unknown>): Partial<Order> {
  const orderChannel = pickString(data, "orderChannel", "channel");

  return {
    ...(data as Partial<Order>),
    ...(orderChannel ? { channel: orderChannel } : {}),
  };
}

export function normalizeOrderMqttPayload(
  payload: Record<string, unknown>,
  context: { topic: string },
): OrderMqttPatch | null {
  const eventType = pickString(payload, "type");
  if (eventType && !SUPPORTED_EVENT_TYPES.has(eventType)) return null;

  const orderDataRecord =
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : undefined;

  const orderId =
    pickString(payload, "orderId") ??
    pickString(orderDataRecord ?? {}, "id") ??
    parseOrderIdFromDetailStatusTopic(context.topic);

  if (!orderId) return null;

  const status =
    pickString(payload, "status") ?? pickString(orderDataRecord ?? {}, "status");

  const statusUpdatedAt =
    pickNumber(orderDataRecord ?? {}, "statusUpdatedAt") ??
    pickNumber(payload, "updatedAt", "timestamp");

  const orderData = orderDataRecord
    ? mapMqttOrderData(orderDataRecord)
    : undefined;

  if (!status && !statusUpdatedAt && !orderData?.status) {
    return null;
  }

  return {
    orderId,
    ...(eventType ? { eventType } : {}),
    ...(status ? { status } : {}),
    ...(statusUpdatedAt != null ? { statusUpdatedAt } : {}),
    ...(orderData ? { orderData } : {}),
  };
}
