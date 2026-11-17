export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayGatewayDataInner {
  keyId?: string;
  razorpayOrderId?: string;
  sessionToken?: string;
  currency?: string;
  posCollect?: {
    amountPaise?: number;
    amount_paise?: number;
  };
}

export interface RazorpayCheckoutSession {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  session_token?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpayPaymentFailedResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

export interface OpenRazorpayCheckoutParams extends RazorpayCheckoutSession {
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  /** User closed checkout without paying */
  onDismiss?: () => void;
  /** Razorpay payment.failed or verification error */
  onPaymentFailed?: (reason: string) => void;
}

export interface RazorpayCheckoutDisplayConfig {
  display?: {
    preferences?: {
      show_default_blocks?: boolean;
    };
  };
}

export interface RazorpayConstructorOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  session_token?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: RazorpayCheckoutSession["prefill"];
  theme?: { color?: string };
  config?: RazorpayCheckoutDisplayConfig;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface OpenRazorpayCheckoutOptions {
  /** When false (default), standard checkout UI (UPI apps / UPI ID). When true, BE session (often QR-first). */
  passSessionTokenToCheckout?: boolean;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => RazorpayInstance;
  }
}

export {};
