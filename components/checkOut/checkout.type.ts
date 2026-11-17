export interface LocationAddress {
    display_name: string;
    lat: string;
    lon: string;
    address: {
      office?: string;
      road?: string;
      postcode?: string;
      suburb?: string;
      state_district?: string;
      country?: string;
      city?: string;
      state?: string;
    };
}


export interface AddressPayload {
    deliveryArea?: string;
    address?: string;
    addressLine2?: string;
    zipCode?: string;
    type?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    hotelName?: string;
    hotelRoomNo?: string;
    id?: string;
    country?: string;
    city?: string;
    state?: string;
    landmark?: string;
    unitNumber?: string;
    locationName?: string;
  }

  export interface AddressEditData extends AddressPayload {
    id?: string;  // Assuming `id` is optional
  }


  export interface CheckoutPayload {
    cartId: string;
    deliveryAddressId?: string;
    orderType: string;
    timezone: string;
    deliveryInstructionsInput?: {
      recordedVoiceMessageUrl?: string;
      avoidCalling?: boolean;
      dontRingBell?: boolean;
    };
    scheduledAt?: number;
    scheduleType?: string;
    paymentMethod?: string;
    /** From integrations config API `payments[].code` (uppercase) */
    paymentGatewayType?: string;
    loyaltyPoints?: number;
    cashAmount?: number;
}

/** QR dine-in: tenant order API body (`POST` `/e-commerce/v1/tenant/order`). */
export type QrTenantOrderPaymentMethod = "CASH" | "UPI" | "CARD" | "ONLINE" | "LOYALTY_POINTS";
export type QrTenantOrderPaymentGateway = "RAZORPAY" | "NONE";

export interface QrTenantOrderCheckoutPayload {
  sessionId: string;
  orderType: "DINE_IN" | "PICKUP" | "DELIVERY";
  timezone: string;
  paymentMethod: QrTenantOrderPaymentMethod;
  paymentGatewayType: QrTenantOrderPaymentGateway;
}


export interface RazorpayGatewayPosCollect {
  amountPaise?: number;
  amount_paise?: number;
}

export interface RazorpayGatewayDataPayload {
  keyId?: string;
  key_id?: string;
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  sessionToken?: string;
  session_token?: string;
  currency?: string;
  posCollect?: RazorpayGatewayPosCollect;
}

export interface CheckoutOrderData {
  orderId?: string;
  id?: string;
  gatewayData?: {
    data?: RazorpayGatewayDataPayload;
  };
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  keyId?: string;
  key_id?: string;
  amount?: number;
  currency?: string;
  payment?: Record<string, unknown>;
  razorpay?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CheckoutResponse {
  message: string;
  data: CheckoutOrderData;
}

export interface DeliveryFeeResponse {
  message: string;
  data: {
    deliveryFees: number;
  };
}
