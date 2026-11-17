import { TranslationKeys } from 'types';

//order item list
export interface ComboGroup {
    id: string;
    groupName: string;
    productId: string;
    productName: Record<string, string>;
    productStatus: string;
    variantAttributes?: Record<string, string>;
    modifierGroup: ModifierGroup[] | null;
    modifiersPrice: number;
    quantity: number;
}

export interface CartItem {
    productName: Record<string, string>;
    productSlug: string;
    productCategorySlug: string;
    subTotalAfterDiscount: number;
    modifierGroup: ModifierGroup[] | null;
    comboGroups?: ComboGroup[];
    quantity: number;
    productId: string;
    productType: string;
    specialInstructions: string;
    productCategory: Record<string, string>;
    id: string;
    cartId: string;
    productCategoryId: string;
    storefrontId: string;
    variantAttributes: Record<string, string>;
    unitBasePrice: number;
    totalBasePrice: number;
    totalBaseDiscountAmount: number;
    totalOfferDiscountAmount: number;
    totalBasePriceAfterBaseDiscount?: number;
    subTotalBeforeDiscountAndTaxes: number;
    subTotalAfterBaseAndOfferDiscount?: number;
    finalPrice: number;
    variantId: string;
    discountCode?: string;
    appliedPromoCode?: {
        id: string;
        promoCode: string;
        promoCodeDiscountAmount: number;
    };
    menuSlug: string;
    metaData?: Record<string, unknown>;
    /** From ticket/session item in QR flow */
    productSku?: string;
    /** Estimated loyalty points for this line (cart / session `data.items[].estimatedLoyaltyPoints`) */
    estimatedLoyaltyPoints?: number;
}

export interface OrderItemListProps {
    cartItems: CartItem[];
    language: string;
    lang: TranslationKeys;
    PLUS_ICON: string;
    cartId: string | undefined;
    upsellProducts: UpsellProduct[];
    cartData: CartData;
    selectedFreebie: string | null;
    store: {
        currentStore: {
            id: string;
            slug: string;
        } | null;
    };
    handleOpenFreebiesModal: (offerId: string) => void;
    showFreebiesModal: boolean;
    storeId: string | null;
    offerId: string | null;
    cartItemsId: string | null;
    UpdateSelectedFreebie: string | null;
    handleCloseFreebiesModal: () => void;
    key?: string | null;
    /** When true, show items from GET sessions (ticket items) instead of cart */
    isQrFlow?: boolean;
}

//order add on list
export interface Extra {
    name: string;
    price: number;
}

export interface AddOnsListSelectorProps {
    lang: { completeYourMealWith: string; peopleAlsoAdded: string; failedToAddItem: string };
    currency: string;
    onAdd?: (extra: AddOn) => void;
    PLUS_ICON: string;
    productId: string;
    productType: string;
    cartItemId: string;
    upsellProducts: UpsellProduct[];
}

export interface AddOn {
    id: string;
    name: string;
    price: number;
    groupName: string;
    groupId: string;
    isMandatory: boolean;
    minSelection: number;
    maxSelection: number;
    currency?: string;
}

//modifier group
export interface Modifier {
    modifierName: { [lang: string]: string };
    totalPrice: number;
    quantity: number;
}

export interface ModifierGroup {
    modifiers: Modifier[];
}

export interface ModifierListProps {
    item: {
        modifierGroup: ModifierGroup[] | null;
        id: string;
        quantity: number;
    };
    language: string;
    /** When true, resolve combo parent / quantity from GET sessions ticket items (tickets[].items[].comboGroups), not cart items */
    isQrFlow?: boolean;
}


//order header 
export interface MyOrderHeaderProps {
    handleBack: () => void;
    lang: {
        myOrder: string;
        items: string;
        activeCart: string;
        tableNo: string;
        dineIn?: string;
        dineInOrderFor?: string;
        table?: string;
        order: {
            cancelOrder: string;
            platformFee: string;
            youllEarn: string;
            onThisOrder: string;
        };
    };
    cartTotal?: CartTotalSummary;
    store: {
        currentStore: {
            name: string;
            id: string;
        } | null;
    };
    cartItems: CartItem[];
    onCancelOrder?: () => void;
}

//order footer
export interface MyOrderFooterProps {
    store: {
        currentStore: {
            name: string;
            id: string;
        } | null;
    };
    storeAddress: string;
    lang: {
        cancel: string;
        checkout: string;
        cancelOrderDescription: string;
        cancelOrderTitle: string;
        yes: string;
        no: string;
        change: string;
        deliverTo: string;
        chooseFreebie: string;
        viewBillDetails: string;
    };
    cartData: CartData | null;
    handleCheckout: () => void;
    cancelOrderId: string;
    buttonText: string;
    addresses: Array<{
        id?: string;
        address?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        type?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    }>;
    handleDeliveryAddressId: (id: string) => void;
    orderType: string;
    deliveryFee: number;
    freebiesData: {
        cartId: string;
        cartTotal: number;
        sessionTotal: number;
        freebieEligible: {
            isEligible: boolean;
            offers: Array<{
                _id: string;
                offerName: Record<string, string>;
                offerDescription: Record<string, string>;
                termCondition: Record<string, string>;
                createTimeStamp: number;
                createTimeStampISO: string;
                isUpdate: boolean;
                updateTimestamp: number;
                offerType: number;
                offerTypeString: string;
                offerBy: number;
                restrictionsDate: {
                    startTime: number;
                    endTime: number;
                };
                storeId: string;
                maximumUser: number;
                status: number;
                statusString: string;
                discountConfig: {
                    minimumSpendValue: number;
                    offerItemData: string[];
                };
                globleUse: number;
            }>;
        };
    } | null;
    handleCurrentFreebies: (currentFreebies: Offer | null) => void;
    selectedFreebie: string | null;
    cartItems: CartItem[];
    showPrice: boolean;
    onViewBillDetails?: () => void;
    onFooterHeightChange?: (height: number) => void;
    onCancelOrder?: () => void;
    isQrFlow?: boolean;
    /** When true, disable checkout and show loader (QR submit). */
    isCheckoutSubmitting?: boolean;
    walletPreviewData?: { orderAmountAfterRedemption: number; cashWalletAmount: number; loyaltyRedemptionValue?: number } | null;
}



export interface Coupon {
    _id: string;
    code: string;
    discount: number;
    type: string;
    description: { [lang: string]: string };
    title: { [lang: string]: string };
    validity: {
        startDateTimestamp: number;
        endDateTimestamp: number;
    };
    termsAndConditions?: { [lang: string]: string };
    // Add other coupon properties as needed
}

export interface CartData {
    data: {
      id: string;
      total: {
        finalAmount: number;
      };
      orderInstruction?: string;
      appliedOffers?: AppliedOffer[];
      appliedPromoCode?: {
        id: string;
        promoCode: string;
        promoCodeDiscountAmount: number;
      };
    };
  }


  export type AddressType = 'Home' | 'Hotel' | 'Office';


  export interface CartTotalSummary {
    cartId: string;
    cartLevelDiscount: number;
    cartLevelTax: number;
    deliveryFee: number;
    finalAmount: number;
    itemLevelDiscount: number;
    itemLevelTax: number;
    itemSubTotal: number;
    totalDiscount: number;
    totalTax: number;
    platformFee: number;
    totalBaseDiscountAmount: number;
    totalOfferDiscountAmount: number;
    tipAmount: number;
    estimatedLoyaltyPoints?: number;
    maximumLoyaltyPointsUsable?: number;
    maxCashbackUsable?: number;
    maximumCashbackPerOrder?: number;
    estimatedCashbackAmount?: number;
  }


  export type Coordinates = {
    latitude: number;
    longitude: number;
  };
  
  export type DeliveryAddress = {
    id: string;
    address: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: string;
    coordinates: Coordinates;
  };

export interface UpsellProduct {
    id: string;
    name: Record<string, string>;
    basePrice: number;
    discountedPrice?: number;
    description?: Record<string, string>;
    media?: Array<{
        url: string;
        type: string;
    }>;
    upsellProducts?: Array<{
        id: string;
        name: Record<string, string>;
        basePrice: number;
    }>;
    cartItemId: string;
    productId: string;
}

export interface AppliedOffer {
    id: string;
    cartId: string;
    cartItemId: string;
    /** Ticket line id from GET sessions (QR flow); used instead of cartItemId when present */
    ticketItemId?: string;
    offerId: string;
    offerName: {
        [key: string]: string;
    };
    offerDescription: {
        [key: string]: string;
    };
    offerStatus: number;
    applicationLevel: string;
    offerType: string;
    discountType: string;
    minimumSpendValue: number;
    discountValue: number;
    discountAmount: number;
    originalPrice: number;
    priority: number;
    appliedAt: number;
}

export interface Offer {
    _id: string;
    offerName: Record<string, string>;
    offerDescription: Record<string, string>;
    termCondition: Record<string, string>;
    createTimeStamp: number;
    createTimeStampISO: string;
    isUpdate: boolean;
    updateTimestamp: number;
    offerType: number;
    offerTypeString: string;
    offerBy: number;
    restrictionsDate: {
        startTime: number;
        endTime: number;
    };
    storeId: string;
    maximumUser: number;
    status: number;
    statusString: string;
    discountConfig: {
        minimumSpendValue: number;
        offerItemData: string[];
    };
    globleUse: number;
    offerId: string;
}

// PLP dynamic route params type
export type PLPParams = {
  city?: string;
  areaName?: string;
  storeSlug?: string;
  menuSlug?: string;
  categorySlug?: string;
  productSlug?: string;
  id?: string; // For /products/[id] route
};
