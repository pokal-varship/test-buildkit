"use client";

import { useCallback, useState } from "react";
import {
  openRazorpayCheckout,
  parseRazorpayCheckoutFromOrderData,
} from "@lib/payment/razorpayCheckout";
import { useToast } from "@components/toast/Toast";
import { RazorpaySuccessResponse } from "@components/payment/razorpay.types";
import {
  cancelRazorpayPaymentOrder,
  verifyRazorpayPayment,
  RazorpayPaymentCancelStatus,
} from "@services/razorpayPaymentService";

export interface OpenRazorpayFromOrderParams {
  orderId: string;
  orderData: Record<string, unknown>;
  storeId?: string;
  storeName?: string;
  razorpayKey?: string;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentDismissed?: () => void;
  /** Called after cancel API succeeds — refresh cart etc. */
  onCartRefresh?: () => void | Promise<void>;
}

export const useRazorpayCheckout = () => {
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isPaymentCancelRefreshing, setIsPaymentCancelRefreshing] =
    useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const toast = useToast();

  const openRazorpayFromOrder = useCallback(
    async ({
      orderId,
      orderData,
      storeId,
      storeName,
      razorpayKey,
      customer,
      onPaymentSuccess,
      onPaymentDismissed,
      onCartRefresh,
    }: OpenRazorpayFromOrderParams) => {
      const session = parseRazorpayCheckoutFromOrderData(orderData, {
        fallbackKey: razorpayKey,
      });

      if (!session) {
        throw new Error(
          "Razorpay payment details missing from order response (gatewayData.data: keyId, razorpayOrderId, posCollect.amountPaise)"
        );
      }

      const razorpayOrderId = session.order_id;
      const sessionToken = session.session_token;

      if (!sessionToken) {
        throw new Error(
          "Payment session token missing from order response (gatewayData.data.sessionToken)"
        );
      }

      const callCancelApi = (
        status: RazorpayPaymentCancelStatus,
        reason: string
      ) => {
        if (!storeId || !razorpayOrderId) return;
        void (async () => {
          setIsPaymentCancelRefreshing(true);
          try {
            await cancelRazorpayPaymentOrder(
              { razorpayOrderId, status, reason },
              storeId
            );
          } catch {
            // Avoid blocking UI if cancel API fails
          } finally {
            await onCartRefresh?.();
            setIsPaymentCancelRefreshing(false);
          }
        })();
      };

      if (!storeId) {
        throw new Error("Store not found for payment");
      }

      setIsRazorpayOpen(true);

      try {
        await openRazorpayCheckout({
          ...session,
          name: storeName || "Store",
          description: `Order ${orderId}`,
          prefill: customer,
          onSuccess: async (response: RazorpaySuccessResponse) => {
            setIsVerifyingPayment(true);
            try {
              await verifyRazorpayPayment(sessionToken, response, storeId);
            } catch (error) {
              setIsVerifyingPayment(false);
              const message =
                error instanceof Error
                  ? error.message
                  : "Payment verification failed";
              toast("error", message);
              onPaymentDismissed?.();
              return;
            }
            setIsVerifyingPayment(false);
            onPaymentSuccess?.(orderId);
          },
          onDismiss: () => {
            onPaymentDismissed?.();
            callCancelApi(
              "PAYMENT_CANCEL_BY_USER",
              "Order cancelled. Payment cancelled by user"
            );
          },
          onPaymentFailed: (reason) => {
            toast("error", reason);
            onPaymentDismissed?.();
            callCancelApi("PAYMENT_FAILED", reason);
          },
        });
      } finally {
        setIsRazorpayOpen(false);
      }
    },
    [toast]
  );

  return {
    openRazorpayFromOrder,
    isRazorpayOpen,
    isPaymentCancelRefreshing,
    isVerifyingPayment,
  };
};
