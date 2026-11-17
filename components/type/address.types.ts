export interface Address {
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
} 