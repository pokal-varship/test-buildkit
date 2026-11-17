import { RazorpayGatewayDataPayload } from "@components/checkOut/checkout.type";
import {
  OpenRazorpayCheckoutParams,
  RazorpayCheckoutSession,
  RazorpayConstructorOptions,
  RazorpayGatewayDataInner,
  RazorpaySuccessResponse,
} from "@components/payment/razorpay.types";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let scriptLoadPromise: Promise<void> | null = null;

type RazorpayFlowState = "open" | "success" | "failed" | "dismissed";

const pickString = (
  obj: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined => {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

const tryNormalizeRecord = (
  record: Record<string, unknown>
): RazorpaySuccessResponse | null => {
  const paymentId = pickString(record, [
    "razorpay_payment_id",
    "razorpayPaymentId",
    "payment_id",
    "paymentId",
  ]);
  const orderId = pickString(record, [
    "razorpay_order_id",
    "razorpayOrderId",
    "razorPayOrderID",
    "order_id",
  ]);
  const signature = pickString(record, [
    "razorpay_signature",
    "razorpaySignature",
    "signature",
  ]);

  if (paymentId && orderId && signature) {
    return {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
    };
  }
  return null;
};

const readGatewayPayload = (
  data: Record<string, unknown>
): RazorpayGatewayDataPayload | undefined => {
  const gatewayData = data.gatewayData;
  if (!gatewayData || typeof gatewayData !== "object") return undefined;
  const inner = (gatewayData as { data?: unknown }).data;
  if (!inner || typeof inner !== "object") return undefined;
  return inner as RazorpayGatewayDataPayload;
};

/** Normalized `gatewayData.data` from checkout order API */
export const getGatewayDataInner = (
  data: Record<string, unknown>
): RazorpayGatewayDataInner | undefined => {
  const inner = readGatewayPayload(data);
  if (!inner) return undefined;

  const amountPaise = inner.posCollect?.amountPaise ?? inner.posCollect?.amount_paise;
  const keyId = inner.keyId ?? inner.key_id;
  const razorpayOrderId = inner.razorpayOrderId ?? inner.razorpay_order_id;
  const sessionToken = inner.sessionToken ?? inner.session_token;

  return {
    keyId,
    razorpayOrderId,
    sessionToken,
    currency: inner.currency,
    posCollect:
      amountPaise !== undefined && !Number.isNaN(amountPaise)
        ? { amountPaise }
        : undefined,
  };
};

export const getSessionTokenFromOrderData = (
  data: Record<string, unknown>
): string | undefined => getGatewayDataInner(data)?.sessionToken;

export const loadRazorpayScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
};

export const parseRazorpayCheckoutFromOrderData = (
  data: Record<string, unknown>,
  options?: { fallbackKey?: string }
): RazorpayCheckoutSession | null => {
  const gateway = getGatewayDataInner(data);

  const key =
    gateway?.keyId ??
    options?.fallbackKey ??
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const razorpayOrderId = gateway?.razorpayOrderId;
  const amountPaise = gateway?.posCollect?.amountPaise;

  if (!key || !razorpayOrderId) {
    return null;
  }

  if (amountPaise === undefined || amountPaise <= 0) {
    return null;
  }

  const session: RazorpayCheckoutSession = {
    key,
    amount: Math.round(amountPaise),
    currency: gateway?.currency ?? "INR",
    order_id: razorpayOrderId,
  };

  if (gateway?.sessionToken) {
    session.session_token = gateway.sessionToken;
  }

  return session;
};

/** Wallet recharge initiate API — flat `data` (keyId, orderId, sessionToken, amount, currency). */
export const parseRazorpayCheckoutFromRechargeData = (
  data: Record<string, unknown>
): RazorpayCheckoutSession | null => {
  const key = pickString(data, ["keyId", "key_id"]);
  const orderId = pickString(data, ["orderId", "order_id", "gatewayOrderId", "gateway_order_id"]);
  const sessionToken = pickString(data, ["sessionToken", "session_token"]);
  const currency =
    pickString(data, ["currency"]) ?? "INR";

  const rawAmount = data.amount;
  const amountMajor =
    typeof rawAmount === "number" && Number.isFinite(rawAmount)
      ? rawAmount
      : typeof rawAmount === "string"
        ? Number.parseFloat(rawAmount)
        : NaN;

  if (!key || !orderId || !Number.isFinite(amountMajor) || amountMajor <= 0) {
    return null;
  }

  const amountPaise = Math.round(amountMajor * 100);

  const session: RazorpayCheckoutSession = {
    key,
    amount: amountPaise,
    currency,
    order_id: orderId,
  };

  if (sessionToken) {
    session.session_token = sessionToken;
  }

  return session;
};

export const normalizeRazorpaySuccessResponse = (
  response: unknown
): RazorpaySuccessResponse | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const direct = tryNormalizeRecord(response as Record<string, unknown>);
  if (direct) return direct;

  const record = response as Record<string, unknown>;
  for (const key of ["data", "payload", "payment", "detail", "response"]) {
    const nested = asRecord(record[key]);
    if (nested) {
      const normalized = tryNormalizeRecord(nested);
      if (normalized) return normalized;
    }
  }

  return null;
};

const getPrimaryColor = (): string => {
  if (typeof window === "undefined") return "#F2C94C";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color")
      .trim() || "#F2C94C"
  );
};

/** Brief wait so a late success event is not treated as user cancel. */
const DISMISS_CANCEL_DELAY_MS = 800;
const SESSION_TOKEN_DISMISS_DELAY_MS = 1200;

export const openRazorpayCheckout = async (
  params: OpenRazorpayCheckoutParams
): Promise<void> => {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK is not available");
  }

  const {
    onSuccess,
    onDismiss,
    onPaymentFailed,
    key,
    amount,
    currency,
    order_id,
    session_token,
    name,
    description,
    prefill,
  } = params;

  let flowState: RazorpayFlowState = "open";
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  const clearDismissTimer = () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  };

  const handlePaymentSuccess = async (rawResponse: unknown) => {
    if (flowState !== "open") {
      return;
    }

    flowState = "success";
    clearDismissTimer();

    const response = normalizeRazorpaySuccessResponse(rawResponse);
    if (!response) {
      flowState = "open";
      return;
    }

    try {
      await onSuccess(response);
    } catch {
      flowState = "failed";
      onPaymentFailed?.("Payment verification failed");
    }
  };

  const scheduleDismissCancel = () => {
    if (flowState !== "open") return;
    clearDismissTimer();
    const delay = session_token
      ? SESSION_TOKEN_DISMISS_DELAY_MS
      : DISMISS_CANCEL_DELAY_MS;
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      if (flowState === "open") {
        flowState = "dismissed";
        onDismiss?.();
      }
    }, delay);
  };

  const rzpOptions: RazorpayConstructorOptions = {
    key,
    amount,
    currency,
    order_id,
    name,
    description,
    prefill,
    theme: { color: getPrimaryColor() },
    handler: (response) => {
      void handlePaymentSuccess(response);
    },
    modal: {
      ondismiss: scheduleDismissCancel,
      escape: true,
      backdropclose: false,
    },
  };

  if (session_token) {
    rzpOptions.session_token = session_token;
  }

  const rzp = new window.Razorpay(rzpOptions);

  const bindSuccessEvent = (eventName: string) => {
    rzp.on(eventName, (response: unknown) => {
      void handlePaymentSuccess(response);
    });
  };

  bindSuccessEvent("payment.success");
  bindSuccessEvent("payment.authorized");
  bindSuccessEvent("payment.captured");

  rzp.on("payment.failed", (response: unknown) => {
    if (flowState === "success") return;
    clearDismissTimer();
    flowState = "failed";
    const failed = response as { error?: { description?: string; reason?: string } };
    const reason =
      failed?.error?.description ??
      failed?.error?.reason ??
      "Payment failed";
    onPaymentFailed?.(reason);
  });

  rzp.open();
};
