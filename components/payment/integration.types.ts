export interface IntegrationPaymentConfig {
  id: string;
  name: string;
  code: string;
  useTestMode: boolean;
  /** Order API `paymentMethod` when provided by BE (e.g. "ONLINE") */
  paymentMethod?: string;
  method?: string;
  /** Razorpay public key when returned by integrations config API */
  keyId?: string;
  key_id?: string;
  publicKey?: string;
  razorpayKeyId?: string;
}

export interface PaymentIntegrationConfigResponse {
  status: string;
  message: string;
  data: {
    payments: IntegrationPaymentConfig[];
  };
}

/** Values for order API, derived only from integration config API */
export interface SelectedIntegrationPayment {
  paymentMethod: string;
  paymentGatewayType: string;
  configId: string;
  razorpayKeyId?: string;
}
