import {
  IntegrationPaymentConfig,
  PaymentIntegrationConfigResponse,
  SelectedIntegrationPayment,
} from "@components/payment/integration.types";

/** Order API `paymentMethod` when config API does not send it */
const DEFAULT_ONLINE_PAYMENT_METHOD = "ONLINE";

/**
 * Same-origin proxy to avoid CORS (see app/api/integrations/config/route.ts).
 */
export const getPaymentIntegrationConfig =
  async (): Promise<PaymentIntegrationConfigResponse> => {
    const response = await fetch(
      `/api/integrations/config?type=payment`,
      {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payment integration config");
    }

    return response.json() as Promise<PaymentIntegrationConfigResponse>;
  };

/**
 * Normalize integrations `payments[].code` to order API `paymentGatewayType`.
 * Backend sometimes sends variants like "stripe-app" that still map to "STRIPE".
 */
export const toPaymentGatewayType = (code: string): string => {
  const normalized = code.trim().toLowerCase();
  if (normalized.startsWith("stripe")) return "STRIPE";
  if (normalized.startsWith("razorpay")) return "RAZORPAY";
  return normalized.toUpperCase();
};

export const mapIntegrationPaymentToOrderFields = (
  payment: IntegrationPaymentConfig
): SelectedIntegrationPayment | null => {
  const code = payment.code?.trim();
  if (!code) return null;

  const paymentMethod = (
    payment.paymentMethod ??
    payment.method ??
    DEFAULT_ONLINE_PAYMENT_METHOD
  ).trim();

  const razorpayKeyId =
    payment.keyId ??
    payment.key_id ??
    payment.publicKey ??
    payment.razorpayKeyId;

  return {
    configId: payment.id,
    paymentMethod,
    paymentGatewayType: toPaymentGatewayType(code),
    razorpayKeyId,
  };
};
