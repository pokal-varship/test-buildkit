import { RazorpaySuccessResponse } from "@components/payment/razorpay.types";
import { getLocationHeader } from "@lib/utils/location";
import { getCookie } from "@lib/cookie";

export type RazorpayPaymentCancelStatus =
  | "PAYMENT_CANCEL_BY_USER"
  | "PAYMENT_FAILED";

export interface CancelRazorpayOrderPayload {
  razorpayOrderId: string;
  status: RazorpayPaymentCancelStatus;
  reason: string;
}

export interface VerifyRazorpayPaymentPayload {
  sessionToken: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Same-origin proxy routes avoid CORS on api.newkommerce.com
 * (see app/api/payment/verify and app/api/payment/cancel).
 */
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
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
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

export const cancelRazorpayPaymentOrder = async (
  payload: CancelRazorpayOrderPayload,
  storeId: string
) => {
  return postPaymentProxy(
    "/api/payment/cancel",
    payload,
    storeId,
    "order-cancel"
  );
};

/** After Razorpay checkout success — verify with BE */
export const verifyRazorpayPayment = async (
  sessionToken: string,
  razorpayResponse: RazorpaySuccessResponse,
  storeId: string
) => {
  const payload: VerifyRazorpayPaymentPayload = {
    sessionToken,
    razorpay_order_id: razorpayResponse.razorpay_order_id,
    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
    razorpay_signature: razorpayResponse.razorpay_signature,
  };

  return postPaymentProxy(
    "/api/payment/verify",
    payload,
    storeId,
    "payment-verify"
  );
};
