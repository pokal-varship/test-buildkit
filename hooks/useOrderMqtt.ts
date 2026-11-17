"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  buildOrderDetailStatusTopic,
  buildOrderListingStatusTopic,
  getIsometrikMqttConfigStatus,
  isIsometrikMqttConfigured,
} from "@config/isometrikMqtt.config";
import { normalizeOrderMqttPayload } from "@lib/mqtt/normalizeOrderMqttPayload";
import { patchOrderFromMqtt } from "@redux/slices/ordersSlice";
import { RootState } from "@redux/store";
import { isometrikMqttManager } from "@services/isometrikMqttManager";

function buildOrderMqttTopicsKey(
  orders: RootState["orders"]["orders"],
  orderId?: string,
  currentOrderDetails?: RootState["orders"]["currentOrderDetails"],
): string {
  const topicSet = new Set<string>();

  orders?.forEach((order) => {
    const storefrontId = order.storefrontId?.trim();
    if (storefrontId) {
      topicSet.add(buildOrderListingStatusTopic(storefrontId));
    }
  });

  const activeOrder =
    (orderId && orders?.find((order) => order.id === orderId)) ||
    (orderId && currentOrderDetails?.id === orderId
      ? currentOrderDetails
      : null);

  if (orderId && activeOrder?.storefrontId) {
    topicSet.add(
      buildOrderDetailStatusTopic(activeOrder.storefrontId, orderId),
    );
  }

  return Array.from(topicSet).join("\0");
}

export function useOrderMqtt(): void {
  const dispatch = useDispatch();
  const params = useParams();
  const { orders, currentOrderDetails } = useSelector(
    (state: RootState) => state.orders,
  );

  const orderId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const mountedRef = useRef(false);

  const topicsKey = useMemo(
    () => buildOrderMqttTopicsKey(orders, orderId, currentOrderDetails),
    [orders, orderId, currentOrderDetails],
  );

  useEffect(() => {
    if (!isIsometrikMqttConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[OrderMQTT] Not configured",
          getIsometrikMqttConfigStatus(),
        );
      }
      return;
    }

    mountedRef.current = true;

    isometrikMqttManager.connect({
      callbacks: {
        onStatus: (status, meta) => {
          if (process.env.NODE_ENV !== "development") return;
          console.log("[OrderMQTT] status:", status, meta?.reason ?? "");
        },
        onEvent: ({ topic, payload }) => {
          if (!mountedRef.current) return;

          const patch = normalizeOrderMqttPayload(payload, { topic });
          if (!patch?.orderId) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[OrderMQTT] ignored payload on", topic, payload);
            }
            return;
          }

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[OrderMQTT] patch",
              patch.eventType ?? "UNKNOWN",
              patch.orderId,
              patch.status ?? patch.orderData?.status,
            );
          }

          dispatch(
            patchOrderFromMqtt({
              orderId: patch.orderId,
              status: patch.status,
              statusUpdatedAt: patch.statusUpdatedAt,
              orderData: patch.orderData,
            }),
          );
        },
      },
    });

    return () => {
      mountedRef.current = false;
      isometrikMqttManager.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isIsometrikMqttConfigured() || !topicsKey) return;
    isometrikMqttManager.syncTopics(topicsKey.split("\0"));
  }, [topicsKey]);
}
