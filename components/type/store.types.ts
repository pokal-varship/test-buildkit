import { SEO } from "types/metadata.type";

// Coordinate position information
export interface Coordinates {
    latitude: number;
    longitude: number;
}

// Address information for a store
export interface StoreAddress {
    id: string;
    address: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: Coordinates;
}

// Rating information
export interface StoreRating {
    average: number;
    count: number;
}

// Ordering options supported by the store
export interface OrderTypeSupport {
    pickup: boolean;
    delivery: boolean;
    dineIn: boolean;
    withinDeliveryRange: boolean;
}

// Pickup / takeaway settings from store API
export interface PickupSettings {
    selfPickup: boolean;
    orderPickupLableAtCheckOut?: string;
    description?: string;
    pickupChargeAmount?: number;
    askForPickupDateAndTimeAtCheckout?: boolean;
    orderFullfillmentTime?: {
        time?: number;
        timeUnit?: string;
    };
    customerPickupDateTime?: string;
    allowChoosingPickupDateWithIn?: {
        time?: number;
        timeUnit?: string;
    };
}

// Enum for menu period types
export enum MenuPeriodType {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    ALL_DAY = "ALL_DAY",
}

// Menu period information
export interface MenuPeriod {
    type: MenuPeriodType;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    id: string;
    slug: string;
    menuType?: string;
}

// Main store information
export interface Store {
    id: string;
    name: string;
    address: StoreAddress;
    rating: StoreRating;
    overallRatings: {
        average: number;
        totalReview: number;
    };
    orderTypeSupport: OrderTypeSupport;
    pickupSettings?: PickupSettings;
    menuPeriods: MenuPeriod[];
    slug: string;
    payment?: {
        enableAtCheckout: boolean;
        serviceOptions: {
            pickup: boolean;
            delivery: boolean;
            dineIn: boolean;
            preOrderEnabled: boolean;
        };
        autoAcceptOrder: boolean;
        nameAtCheckout: string;
        method: string;
        instructions: string;
        stripeConnected?: boolean;
    }[];
    citySlug: string;
    areaSlug: string;
    /** Tenant vertical from /v1/tenant/store — e.g. Retail, Restaurant, Laundry, Grocery */
    accountType?: string;
}

type PageConfig = {
    slug: string;
    images: {
        id: number;
        url: string;
    }[];
};

// Define the StoreData type that includes SEO and PageConfig
export type StoreData = {
    data: {
        seo: SEO;
        pageConfig: PageConfig;
        tenantId: string;
    };
};


export interface RestaurantData {
    id: string;
    name: string;
    distances: {
        distance: number;
        unit: string;
    };
    address: {
        id: string;
        address: string;
        addressLine2?: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    overallRatings: {
        average: number;
        totalReview: number;
    };
    rating: {
        average: number;
        count: number;
    };
    orderTypeSupport: {
        pickup: boolean;
        delivery: boolean;
        dineIn: boolean;
        withinDeliveryRange: boolean;
    };
    pickupSettings?: PickupSettings;
    menuPeriods: Array<{
        type: string;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
        id: string;
        slug: string;
        menuType?: string;
    }>;
    slug: string;
    citySlug: string;
    areaSlug: string;
    isOpen?: boolean;
}


export type RestaurantCardProps = {
    name: string;
    distance: React.ReactNode;
    address: string;
    rating: number;
    reviews: number;
    restaurantData: { 
        title: string; 
        openStatus: string; 
        hours: string; 
        id?: string; 
        slug?: string;
    }[];
    store: Store;
    onClose?: () => void;
    urlManagement?: {
        canonicalUrl: string;
        currentUrl: string;
        customSlug: string;
        urlPattern: string;
    };
    productCategorySlug?: string;
    linkedMenus?: Array<{
        menuId: string;
        menuSlug: string;
    }>;
    /** Compact layout: icon + location name + rating only, no distance/address. Used from scan-order menu modal. */
    scanOrderMode?: boolean;
    locationDisplayName?: string;
    /** When true, Order/View Menu navigates to /{storeSlug}/{menuSlug}/full-menu (scan-order flow). */
    redirectToFullMenu?: boolean;
};


export interface RestaurantHoursProps {
    title: string;
    status: string;
    time: string;
    store: Store;
    id: string;
    slug: string;
    onClose?: () => void;
    urlManagement?: {
        canonicalUrl: string;
        currentUrl: string;
        customSlug: string;
        urlPattern: string;
    };
    productCategorySlug?: string;
    linkedMenus?: Array<{
        menuId: string;
        menuSlug: string;
    }>;
    scanOrderMode?: boolean;
    /** When true, Order/View Menu navigates to /{storeSlug}/{menuSlug}/full-menu (scan-order flow). */
    redirectToFullMenu?: boolean;
}


export interface Category {
    categoryId: string;
    displayName: string;
    categoryName?: {
        en: string;
        ar: string;
    };
    categorySlug?: string;
    icon: {
        url: string;
        altText: string | null;
        mobileUrl: string;
    };
}

export interface StorePageData {
    data: {
        pageConfig: {
            images: { url: string }[];
        };
        seo?: {
            structuredData?: {
                type: string;
                properties: {
                    address: {
                        id: string;
                        address: string;
                        addressLine2?: string;
                        landmark: string;
                        city: string;
                        state: string;
                        country: string;
                        zipCode: string;
                        coordinates: {
                            latitude: number;
                            longitude: number;
                        };
                    };
                    id: string;
                    image: string[];
                    name: string;
                    email: string;
                    telephone: string;
                    url: string;
                    workingHours: Array<{
                        day: string;
                        timeSlots: Array<{
                            startTime: string;
                            endTime: string;
                        }>;
                        isOpen: boolean;
                    }>;
                };
            };
            openGraph?: {
                title: string;
                description: string;
                image: string;
                type: string;
            };
        };
        tenantId: string;
    };
}



export interface UserProfile {
    id: string;
    email: string;
    clientName: string;
    clientId: string;
    userId: string;
    keycloakUserId: string;
    userType: string;
    timeZone: string;
    name: string;
    phoneNumber: string;
    emailVerified: boolean;
    accessToken?: string;
    refreshToken?: string;
    permission: {
        dashboard: string[];
    };
    token: {
        access_token: string;
        id_token: string;
        expires_in: number;
        refresh_expires_in: number;
        refresh_token: string;
        token_type: string;
        not_before_policy: number;
        session_state: string;
        scope: string;
    };
    userProfileUrl: string;
    accountType: string;
}