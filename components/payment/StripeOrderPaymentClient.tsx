"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import Loader from "@components/loader/Loader";
import { useToast } from "@components/toast/Toast";
import Icon from "@components/image/Icons";
import { CROSS_ICON } from "@config/Header/image.config";
import { close_dialog } from "@lib/modalHandler";
import StripeElementsCheckoutForm from "@components/payment/StripeElementsCheckoutForm";
import { getLocationHeader } from "@lib/utils/location";
import { getCookie } from "@lib/cookie";

interface StripeOrderPaymentClientProps {
  orderId: string;
  orderData: Record<string, unknown>;
  storeId: string;
  storeName?: string;
  stripeKey?: string;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentDismissed?: () => void;
  onCartRefresh?: () => void | Promise<void>;
  onPaymentVerifying?: (verifying: boolean) => void;
}

const getCssVariable = (variableName: string, fallback: string = ""): string => {
  if (typeof window !== "undefined" && document.documentElement) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
    return value || fallback;
  }
  return fallback;
};

const buildAppearance = (): Appearance => ({
  theme: "stripe",
  variables: {
    colorPrimary: getCssVariable("--primary-color", "#0074D9"),
    colorBackground: getCssVariable("--cards-containers", "#FFFFFF"),
    colorText: getCssVariable("--primary-text", "#333333"),
    colorDanger: getCssVariable("--error", "#FF4136"),
    fontFamily: getCssVariable("--font-family", "system-ui, -apple-system, sans-serif"),
    spacingUnit: "4px",
    borderRadius: "8px",
  },
});

type StripePaymentCancelStatus = "PAYMENT_CANCEL_BY_USER" | "PAYMENT_FAILED";

const pickString = (
  obj: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined => {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

const isPaymentIntentClientSecret = (value: string): boolean =>
  value.startsWith("pi_") && value.includes("_secret_");

const extractPaymentIntentIdFromSecret = (clientSecret: string): string | undefined => {
  const trimmed = clientSecret.trim();
  if (!isPaymentIntentClientSecret(trimmed)) return undefined;
  const idx = trimmed.indexOf("_secret_");
  if (idx <= 0) return undefined;
  return trimmed.slice(0, idx);
};

const pickPaymentIntentClientSecret = (
  obj: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined => {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && isPaymentIntentClientSecret(value.trim())) {
      return value.trim();
    }
  }
  return undefined;
};

const parseStripeSessionFromOrderData = (
  orderData: Record<string, unknown>,
  stripeKey?: string
) => {
  const gatewayData = orderData.gatewayData;
  const inner =
    gatewayData && typeof gatewayData === "object"
      ? (gatewayData as { data?: unknown }).data
      : undefined;
  const gatewayInner =
    inner && typeof inner === "object" ? (inner as Record<string, unknown>) : undefined;

  const publishableKey =
    pickString(gatewayInner, ["keyId", "key_id"]) ??
    stripeKey?.trim() ??
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  const sessionToken =
    pickString(gatewayInner, ["sessionToken", "session_token"]) ?? "";

  const paymentIntentClientSecret =
    pickPaymentIntentClientSecret(orderData, [
      "clientSecret",
      "paymentIntentClientSecret",
      "payment_intent_client_secret",
    ]) ??
    pickPaymentIntentClientSecret(gatewayInner, [
      "clientSecret",
      "paymentIntentClientSecret",
      "payment_intent_client_secret",
    ]) ??
    "";

  const paymentGetwayOrderId = pickString(orderData, ["paymentGetwayOrderId"]);
  const nestedPaymentIntentId = pickString(gatewayInner, ["stripePaymentIntentId"]);
  const paymentIntentId =
    (paymentGetwayOrderId?.startsWith("pi_") ? paymentGetwayOrderId : undefined) ??
    nestedPaymentIntentId ??
    (paymentIntentClientSecret
      ? extractPaymentIntentIdFromSecret(paymentIntentClientSecret)
      : undefined) ??
    "";

  const stripeAccountId = pickString(gatewayInner, ["stripeAccountId"]);

  if (!publishableKey || !paymentIntentClientSecret || !paymentIntentId) {
    return null;
  }

  return {
    publishableKey,
    sessionToken,
    paymentIntentClientSecret,
    paymentIntentId,
    stripeAccountId,
  };
};

const postPaymentProxy = async (
  path: string,
  body: unknown,
  storeId: string,
  locationTrigger: string
) => {
  const locationHeader = await getLocationHeader(locationTrigger);
  const token = getCookie("token");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Store-Id": storeId,
    "X-User-Location": locationHeader,
  };

  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Payment request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

const cancelStripePaymentOrder = async (
  payload: { razorpayOrderId: string; status: StripePaymentCancelStatus; reason: string },
  storeId: string
) => postPaymentProxy("/api/payment/cancel", payload, storeId, "order-cancel");

const verifyStripePayment = async (
  sessionToken: string,
  stripePaymentIntentId: string,
  storeId: string
) =>
  postPaymentProxy(
    "/api/payment/verify",
    {
      sessionToken,
      stripe_payment_intent_id: stripePaymentIntentId,
      payment_intent_id: stripePaymentIntentId,
    },
    storeId,
    "payment-verify"
  );

const StripeOrderPaymentForm = ({
  orderId,
  storeId,
  sessionToken,
  paymentIntentId,
  clientSecret,
  onPaymentSuccess,
  onPaymentDismissed,
  onCartRefresh,
  onPaymentVerifying,
}: {
  orderId: string;
  storeId: string;
  sessionToken: string;
  paymentIntentId: string;
  clientSecret: string;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentDismissed?: () => void;
  onCartRefresh?: () => void | Promise<void>;
  onPaymentVerifying?: (verifying: boolean) => void;
}) => {
  const toast = useToast();

  const callCancelApi = (status: StripePaymentCancelStatus, reason: string) => {
    if (!storeId || !paymentIntentId) return;
    void (async () => {
      try {
        await cancelStripePaymentOrder(
          { razorpayOrderId: paymentIntentId, status, reason },
          storeId
        );
      } catch {
        // Avoid blocking UI if cancel API fails
      } finally {
        await onCartRefresh?.();
      }
    })();
  };

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      onPaymentDismissed?.();
      callCancelApi(
        "PAYMENT_CANCEL_BY_USER",
        "Order cancelled. Payment cancelled by user"
      );
      close_dialog(["stripeOrderPayment"]);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, paymentIntentId, sessionToken]);

  return (
    <StripeElementsCheckoutForm
      clientSecret={clientSecret}
      onFailed={(message) => {
        toast("error", message);
        onPaymentDismissed?.();
        callCancelApi("PAYMENT_FAILED", message);
      }}
      onConfirmed={async (confirmedPaymentIntentId) => {
        const paidIntentId = confirmedPaymentIntentId ?? paymentIntentId;
        onPaymentVerifying?.(true);
        try {
          if (sessionToken) {
            await verifyStripePayment(sessionToken, paidIntentId, storeId);
          }
        } catch (error) {
          onPaymentVerifying?.(false);
          const message =
            error instanceof Error
              ? error.message
              : "Payment verification failed";
          toast("error", message);
          onPaymentDismissed?.();
          return;
        }
        onPaymentVerifying?.(false);
        onPaymentSuccess?.(orderId);
        close_dialog(["stripeOrderPayment"]);
      }}
    />
  );
};

export default function StripeOrderPaymentClient(props: StripeOrderPaymentClientProps) {
  const {
    orderId,
    orderData,
    storeId,
    storeName,
    stripeKey,
    onPaymentSuccess,
    onPaymentDismissed,
    onCartRefresh,
    onPaymentVerifying,
  } = props;

  const toast = useToast();
  const [ready, setReady] = useState(false);
  const sessionRef = useRef<ReturnType<typeof parseStripeSessionFromOrderData> | null>(null);

  const session = useMemo(() => {
    const parsed = parseStripeSessionFromOrderData(orderData, stripeKey);
    sessionRef.current = parsed;
    return parsed;
  }, [orderData, stripeKey]);

  const stripePromise = useMemo(() => {
    if (!session) return null;
    return loadStripe(session.publishableKey, {
      stripeAccount: session.stripeAccountId,
    });
  }, [session]);

  useEffect(() => {
    if (!session) {
      toast(
        "error",
        "Stripe payment details missing (publishable key, payment intent client secret, or payment intent id)."
      );
      close_dialog(["stripeOrderPayment"]);
      return;
    }
    setReady(true);
  }, [session, toast]);

  if (!session || !stripePromise || !ready) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="stripe-order-payment-container">
      <div className="stripe-order-payment-header flex justify-between items-center mb-5">
        <h2 className="stripe-order-payment-title">{storeName || "Payment"}</h2>
        <Icon
          icon={`${CROSS_ICON}#cross`}
          width={16}
          height={16}
          color={"var(--primary-text)"}
          className="cursor-pointer"
          viewBox="0 0 16 16"
          onClick={() => {
            onPaymentDismissed?.();
            void (async () => {
              try {
                await cancelStripePaymentOrder(
                  {
                    razorpayOrderId: session.paymentIntentId,
                    status: "PAYMENT_CANCEL_BY_USER",
                    reason: "Order cancelled. Payment cancelled by user",
                  },
                  storeId
                );
              } catch {
                // ignore
              } finally {
                await onCartRefresh?.();
                close_dialog(["stripeOrderPayment"]);
              }
            })();
          }}
        />
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: session.paymentIntentClientSecret,
          appearance: buildAppearance(),
        }}
      >
        <StripeOrderPaymentForm
          orderId={orderId}
          storeId={storeId}
          sessionToken={session.sessionToken}
          paymentIntentId={session.paymentIntentId}
          clientSecret={session.paymentIntentClientSecret}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentDismissed={onPaymentDismissed}
          onCartRefresh={onCartRefresh}
          onPaymentVerifying={onPaymentVerifying}
        />
      </Elements>

      <style>{`
        .stripe-order-payment-container{
          background-color: var(--cards-containers);
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          padding: 1.25rem;
          border-radius: 0.375rem;
        }
        .stripe-order-payment-title{
          font-size: var(--heading-h3);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }
      `}</style>
    </div>
  );
}

