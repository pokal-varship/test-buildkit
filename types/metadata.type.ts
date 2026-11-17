export interface SEO {
    metaTitle?: string;
    metaDescription?: string;
    title: string;
    description: string;
    keywords?: string[];
    robots?: string;
    metadataBase: string | undefined;
    publisher?: string;
    openGraph: {
        title: string;
        description: string;
        images: string;
        image?: string;
        type: 'website' | string;
    };
    structuredData?: {
        type: string;
        properties: {
            name: string;
            url: string;
        };
    };
    alternates?: {
        canonical?: string;
    };
    canonicalUrl?: string;
}

export interface homePageSEO {
    metaTitle?: string;
    metaDescription?: string;
    title: string;
    description: string;
    keywords?: string[];
    robots?: string;
    metadataBase: string | undefined;
    publisher?: string;
    openGraph: {
        title: string;
        description: string;
        images: string;
        image?: string;
        type: 'website' | string;
    };
    structuredData?: {
        type: string;
        properties: {
            context: string;
            name: string;
            description: string;
            url: string;
            potentialAction: {
                type: string;
                target: string;
                "query-input": string;
            };
        };
    };
    alternates?: {
        canonical?: string;
    };
    canonicalUrl?: string;
}

