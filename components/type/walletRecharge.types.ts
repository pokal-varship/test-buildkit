export interface WalletRechargeInitiatePayload {
  userId: string;
  tenantId: string;
  storeId: string;
  currency: string;
  amount: number;
  paymentGatewayType?: string;
}

export interface WalletRechargeInitiateData {
  amount: number;
  commerceOrderId?: string;
  currency: string;
  gatewayOrderId?: string;
  keyId?: string;
  orderId?: string;
  paymentStatus?: string;
  sessionToken?: string;
  status?: string;
  clientSecret?: string;
  stripeAccountId?: string;
  stripePaymentIntentId?: string;
}

export interface WalletRechargeInitiateResponse {
  message?: string;
  data?: WalletRechargeInitiateData;
}
