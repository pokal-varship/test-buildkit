// Base schema types
export interface BaseSchema {
    "@context": string;
    "@type": string;
}

// Address types
export interface PostalAddress {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
}

// Geographic coordinates
export interface GeoCoordinates {
    "@type": "GeoCoordinates";
    longitude: number;
    latitude: number;
}

// Restaurant schema
export interface RestaurantSchema {
    "@context"?: string; // Optional since it's not needed when nested
    "@type": "Restaurant";
    name: string;
    telephone?: string;
    hasMenu?: string;
    address: PostalAddress;
    geo?: GeoCoordinates; // Optional - only include if coordinates are available
    url?: string;
}

// Organization schema
export interface OrganizationSchema extends BaseSchema {
    "@type": "Organization";
    name: string;
    logo?: string;
    url: string;
    keywords?: string[];
    subOrganization?: RestaurantSchema[];
    contactPoint?: {
        "@type": "ContactPoint";
        telephone?: string;
        contactType?: string;
        email?: string;
    };
    description?: string;
    foundingDate?: string;
    founder?: {
        "@type": "Person";
        name: string;
    };
}

// Website schema
export interface WebsiteSchema extends BaseSchema {
    "@type": "WebSite";
    name: string;
    description?: string;
    url: string;
    potentialAction?: {
        "@type": "SearchAction";
        target: string;
        "query-input": string;
    };
}

// Article schema
export interface ArticleSchema extends BaseSchema {
    "@type": "Article";
    headline: string;
    description?: string;
    author?: {
        "@type": "Person";
        name: string;
    };
    publisher?: {
        "@type": "Organization";
        name: string;
    };
    datePublished: string;
    dateModified: string;
    image?: string;
    articleBody?: string;
}

// Product schema
export interface ProductSchema extends BaseSchema {
    "@type": "Product";
    name: string;
    description?: string;
    brand?: {
        "@type": "Brand";
        name: string;
    };
    offers?: {
        "@type": "Offer";
        price: string;
        priceCurrency: string;
        availability: string;
        url?: string;
    };
    image?: string;
    category?: string;
}

// Page schema data interface
export interface PageSchemaData {
    "@context"?: string;
    "@type"?: string;
    name?: string;
    description?: string;
    url?: string;
    logo?: string;
    keywords?: string[];
    subOrganization?: RestaurantSchema[];
    contactPoint?: {
        "@type": "ContactPoint";
        telephone?: string;
        contactType?: string;
        email?: string;
    };
    potentialAction?: {
        "@type": "SearchAction";
        target: string;
        "query-input": string;
    };
    [key: string]: string | string[] | RestaurantSchema[] | {
        "@type": "ContactPoint";
        telephone?: string;
        contactType?: string;
        email?: string;
    } | {
        "@type": "SearchAction";
        target: string;
        "query-input": string;
    } | undefined; // Allow additional properties with proper typing
}

// Breadcrumb item interface
export interface BreadcrumbItem {
    position: number;
    name: string;
    item: string;
}

// Page schema props interface
export interface PageSchemaProps {
    data?: PageSchemaData;
    schemaType?: 'organization' | 'website' | 'restaurant' | 'article' | 'product' | 'custom';
    pageType?: 'home' | 'about' | 'menu' | 'contact' | 'products' | 'events' | 'custom';
    restaurants?: RestaurantSchema[]; // For organization schema with multiple restaurants
    breadcrumbs?: BreadcrumbItem[]; // Optional breadcrumb navigation items
}

// Schema types for different page types
export type SchemaType = 
    | OrganizationSchema 
    | WebsiteSchema 
    | RestaurantSchema 
    | ArticleSchema 
    | ProductSchema;
