import { homePageSEO } from "types/metadata.type";

type PageConfig = {
    title: string;
    subheader: string;
    addressPlaceholder: string;
    buttonLabels: {
        order: string;
        search: string;
    };
    slug: string;
    images: {
        id: number;
        url: string;
    }[];
};

export type HomePageData = {
    data: {
        seo: homePageSEO;
        pageConfig: PageConfig;
        tenantId: string;
    };
};


export interface HomePageLocationData {
    data: {
        pageConfig: {
            title: string;
            subheader: string;
            addressPlaceholder: string;
            images: { url: string }[];
        };
        seo?: {
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
        };
    };
}

export interface LocationsClientProps {
    homePageData: HomePageLocationData;  // Updated type definition
    onClose?: () => void;
}



export type Coordinates = {
    latitude: number;
    longitude: number;
}

export interface LocationFetcherProps {
    children: (location: Coordinates | null, error: string | null) => React.ReactNode;
}

export interface WebsiteSchemaProps {
    data?: {
        type: string; // Ensure this property is required
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
    } | undefined; // Allow data to be undefined, but not an empty object
}