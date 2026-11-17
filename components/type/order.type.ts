import { DeliveryAddress, ComboGroup } from "@components/order/order.type";

export interface OrderResponse {
  status: string;
  message: string;
  data: Order[];
}

export interface OrderByIdResponse {
  status: string;
  message: string;
  data: Order[] | Order;
}

export interface Order {
  id: string;
  accountId: string;
  orderInstruction: string;
  appliedPromoCode: PromoCode;
  appliedOffers?: AppliedOffer[];
  storefrontId: string;
  storefrontName: string;
  storePhone?: string;
  storeAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    country: string;
    landmark: string;
    latitude: number;
    longitude: number;
    orderId: string;
    postalCode: string;
    state: string;
  };
  cartId: string;
  orderType: string;
  orderNumber: string;
  customerDetails: CustomerDetails;
  orderTotal: OrderTotal;
  paymentMethod: string;
  payment?: OrderPayment;
  paymentDetails: {
    card: {
      brand: string;
      funding: string;
      last4: string;
      network: string;
    };
    type: string;
  };
  paymentStatus: string;
  deliveryInfo: DeliveryInfo;
  driverInfo: DriverInfo;
  createdByType: string;
  createdById: string;
  metaData: Record<string, unknown> | null;
  scheduleType: string;
  createdAt: number;
  deliveryStartAt: number;
  deliveryEndAt: number;
  items: OrderItem[];
  status: string;
  statusUpdatedAt: number;
  channel: string;
  statusLogs: StatusLog[];
  reasonTypeId: number;
  reasonType: string;
  reasonId: string;
  reason: string;
  deliveryAddress: DeliveryAddress;
  scheduledAt?: number;
  storefrontSlug?: string;
  citySlug?: string;
  areaSlug?: string;
  refundInitiatedAt?: number;
  refundMethods?: Array<RefundMethod | null>;
}

export interface RefundMethod {
  amount: number;
  expectedRefundAt?: number;
  referenceNumber?: string;
  tenderId?: string;
  tenderType: PaymentTenderType;
  loyaltyPoints?: number;
  status?: string;
}

export interface CustomerDetails {
  orderId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  phoneIsoCode: string;
}

export type PaymentTenderType =
  | "LOYALTY_POINTS"
  | "CASH_WALLET"
  | "WALLET"
  | "CASH"
  | "UPI"
  | "CARD"
  | string;

export interface PaymentTenderGatewayData {
  last4?: string;
  loyaltyPoints?: number;
  points?: number;
}

export interface PaymentTender {
  tenderType?: PaymentTenderType;
  type?: PaymentTenderType;
  amount?: number | { value?: number; amount?: number };
  tenderAmount?: number;
  value?: number;
  paidAmount?: number;
  appliedAmount?: number;
  transactionAmount?: number;
  tenderValue?: number;
  loyaltyPoints?: number;
  points?: number;
  redemptionPoints?: number;
  last4?: string;
  gatewayData?: PaymentTenderGatewayData | string;
}

export interface PaymentParty {
  tenders?: PaymentTender[];
}

export interface OrderPayment {
  parties?: PaymentParty[];
}

export interface OrderTotal {
  refundAmount?: number;
  orderId: string;
  itemSubTotal: number;
  deliveryFee: number;
  itemLevelDiscount: number;
  orderLevelDiscounts: number;
  itemLevelTax: number;
  orderLevelTax: number;
  totalDiscount: number;
  totalTax: number;
  finalAmount: number;
  grandTotal?: number;
  tipAmount: number;
  memberCreditUsed?: number;
  loyaltyRedemptionValue?: number;
  loyaltyRedemptionPoints?: number;
  earnedLoyaltyPoints?: number;
}

export interface DeliveryInfo {
  orderId: string;
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryInstructions: string;
  type: string;
}

export interface DriverInfo {
  id: string;
  orderId: string;
  driverId?: string;
  name: string;
  contact_number: string;
  rating: number;
  channel: string;
}

export interface PromoCode {
  createdAt: number;
  id: string;
  lastModifiedAt: number;
  orderId: string;
  promoCode: string;
  promoCodeApplicationLevel: string;
  promoCodeDescription: {
    de: string;
    en: string;
    fr: string;
  };
  promoCodeDiscountAmount: number;
  promoCodeId: string;
  promoCodeMaximumDiscountAmount: number;
  promoCodeMinimumSpendValue: number;
  promoCodeTitle: {
    de: string;
    en: string;
    fr: string;
  };
  promoCodeType: string;
  promoCodeValue: number;
}

export interface AppliedOffer {
  id: string;
  offerId: string;
  offerType: string;
  offerName: Record<string, string>;
  offerDescription: Record<string, string>;
  offerStatus: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  minimumSpendValue: number;
  applicationLevel: string;
  priority: number;
  appliedAt: number;
  orderItemId?: string;
  freeItemId?: string;
  freeQuantity?: number;
  originalPrice?: number;
}

export interface OrderItem {
  id: string;
  storefrontId: string;
  orderInstruction: string;
  appliedPromoCode: PromoCode;
  storeAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    country: string;
    landmark: string;
    latitude: number;
    longitude: number;
    orderId: string;
    postalCode: string;
    state: string;
  };
  orderId: string;
  productId: string;
  productName: { en: string };
  productCategoryId: string;
  productCategory: { en: string };
  productType: string;
  productSku: string;
  variantId: string;
  variantSku: string;
  variantAttributes: { size: string };
  modifierGroup: ModifierGroup[] | null;
  comboGroups?: ComboGroup[];
  quantity: number;
  unitBasePrice: number;
  totalBasePrice: number;
  totalBasePriceAfterBaseDiscount: number;
  baseModifiersPrice: number;
  subTotalAfterBaseDiscount: number;
  subTotalAfterBaseAndOfferDiscount?: number;
  finalModifiersPrice: number;
  subTotalBeforeDiscountAndTaxes: number;
  baseDiscountAmount: number;
  offerDiscountAmount: number;
  promoDiscountAmount: number;
  totalBaseDiscountAmount: number;
  totalOfferDiscountAmount: number;
  totalPromoDiscountAmount: number;
  totalDiscountAmount: number;
  subTotalAfterDiscount: number;
  taxRate: number;
  taxAmount: number;
  finalPrice: number;
  specialInstructions: string;
  metaData: Record<string, unknown> | null;
  hasProductOffer: boolean;
  productOfferType: string;
  productOfferValue: number;
  productOfferDescription: string;
  isPromoCodeApplied: boolean;
  bogoQuantity: number;
  bundleDiscountThreshold: number;
  createdAt: number;
  updatedAt: number;
  menuSlug?: string;
  productSlug?: string;
  productCategorySlug?: string;
  mediaURL?: string;
  earnedLoyaltyPoints?: number;
}

export interface  ModifierName {
  en: string;
};

 export type Modifier = {
  id: string;
  storefrontId: string;
  modifierGroupDetailId: string;
  modifierId: string;
  modifierName: ModifierName;
  modifierSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type ModifierGroup = {
  id: string;
  storefrontId: string;
  modifierGroupId: string;
  modifierGroupName: ModifierName;
  modifiersPrice: number;
  modifiers: Modifier[];
};

export interface StatusLog {
  id: string;
  orderId: string;
  actionById: string;
  status: string;
  notes: string;
  createdAt: number;
}

export type Address = {
  orderId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  addressId?: string;
  deliveryInstructions?: string;
};


// cancel reason type

export type CancelStatusLog = {
  status: string;
  timeStamp: number;
  actionByUserId: string;
  notes: string;
};

export type Reason = {
  en: string;
  hi: string;
};

export type ReasonData = {
  id: string;
  reasons: Reason;
  reasonId: number;
  type: string;
  categories: string;
  returnToStore: boolean;
  reattempt: boolean;
  statusLogs: CancelStatusLog[];
};

export type CancelReasonResponse = {
  status: string;
  message: string;
  data: ReasonData[];
  totalCount: number;
  isStoreReason: boolean;
};

export type ReasonTypeData = {
  id: string;
  reasonId: number;
  type: string;
  category: string;
  isReasonRequired?: boolean;
  isAllowOther?: boolean;
};

export type ReasonTypeResponse = {
  status: string;
  message: string;
  data: ReasonTypeData[];
  totalCount: number;
};

export type OrderCancelReasonsPayload = {
  reasons: ReasonData[];
  isReasonRequired: boolean;
};

export type CancelOrderResponse = {
  status: string;
  message: string;
  data: {
    message: string;
    orderId: string;
  };
};


export interface ReviewPayload {
  order_id: string;
  title: string;
  content: string;
  source_channel: string;
  media_files: Array<{
    media_type: string;
    media_url: string;
  }>;
  product_id: string;
  product_rating: Array<{
    parameter_id: string;
    rating: number;
  }>;
}

export interface UpsellProduct {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
    basePrice: number;
    discountedPrice: number;
    media: Array<{
        url: string;
        type: string;
    }>;
    upsellProducts: Array<{
        id: string;
        name: Record<string, string>;
        basePrice: number;
    }>;
    cartItemId: string;
    productId: string;
}

export interface OrderAgain {
  id: number;
  date: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    image: string;
  }>;
}

