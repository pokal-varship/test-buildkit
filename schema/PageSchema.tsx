import React from 'react';
import {
    ArticleSchema,
    OrganizationSchema,
    PageSchemaProps,
    ProductSchema,
    RestaurantSchema,
    WebsiteSchema,
    SchemaType
} from '@components/type/schema.types';
import { getTenantConfig } from '@config/tenant.config';
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';

const PageSchema: React.FC<PageSchemaProps> = ({ 
    data, 
    schemaType = 'organization',
    pageType = 'home',
    restaurants = [],
    breadcrumbs
}) => {
    const config = getTenantConfig();
    const baseUrl = config.webUrl || "";
    
    // Default schema configurations for different page types
    const getDefaultSchema = (): SchemaType | { "@context": string; "@type": string; name: string; url: string } => {
        switch (schemaType) {
            case 'organization':
                const defaultRestaurants: RestaurantSchema[] = restaurants.length > 0 ? restaurants : [
                    {
                        "@type": "Restaurant",
                        name: config.appName || process.env.NEXT_PUBLIC_APP_NAME || "",
                        telephone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
                        hasMenu: baseUrl,
                        address: {
                            "@type": "PostalAddress",
                            streetAddress: "",
                            addressLocality: "",
                            addressRegion: "",
                            postalCode: "",
                            addressCountry: ""
                        },
                        url: baseUrl,
                    }
                ];

                return {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: config.appName || process.env.NEXT_PUBLIC_APP_NAME || "",
                    logo: config?.lightLogoUrl || config?.darkLogoUrl || "",
                    url: baseUrl,
                    keywords: [
                        "Restaurant",
                        "Food",
                        "Dining",
                        "Takeout",
                        "Delivery",
                        "Local Cuisine"
                    ],
                    subOrganization: defaultRestaurants,
                } as OrganizationSchema;
            
            case 'website':
                return {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: config.appName || "Website Name",
                    url: baseUrl,
                    potentialAction: {
                        "@type": "SearchAction",
                        target: `${baseUrl}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string"
                    }
                } as WebsiteSchema;
            
            case 'restaurant':
                return {
                    "@context": "https://schema.org",
                    "@type": "Restaurant",
                    name: config.appName || process.env.NEXT_PUBLIC_APP_NAME || "",
                    telephone: "+91 98765 43210",
                    hasMenu: baseUrl,
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "",
                        addressLocality: "",
                        addressRegion: "",
                        postalCode: "",
                        addressCountry: ""
                    },
                    url: baseUrl,
                } as RestaurantSchema;
            
            case 'article':
                return {
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: "Article Title",
                    description: "Article description",
                    author: {
                        "@type": "Person",
                        name: "Author Name"
                    },
                    publisher: {
                        "@type": "Organization",
                        name: config.appName || ""
                    },
                    datePublished: new Date().toISOString(),
                    dateModified: new Date().toISOString()
                } as ArticleSchema;
            
            case 'product':
                return {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: "Product Name",
                    description: "Product description",
                    brand: {
                        "@type": "Brand",
                        name: config.appName || ""
                    },
                    offers: {
                        "@type": "Offer",
                        price: "0.00",
                        priceCurrency: "USD",
                        availability: "https://schema.org/InStock"
                    }
                } as ProductSchema;
            
            default:
                return {
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    name: config.appName || "Web Page",
                    url: baseUrl
                };
        }
    };

    // If no data provided, use default schema
    if (!data) {
        const defaultSchema = getDefaultSchema();
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(defaultSchema)
                    }}
                />
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <BreadcrumbSchema items={breadcrumbs} id={`breadcrumb-${pageType}`} />
                )}
            </>
        );
    }

    // Merge provided data with defaults
    const defaultSchema = getDefaultSchema();
    const schemaData = {
        ...defaultSchema,
        ...data,
        // Ensure @context and @type are properly set
        "@context": data["@context"] || defaultSchema["@context"],
        "@type": data["@type"] || defaultSchema["@type"]
    };

    // Handle subOrganization merging for organization schema
    if (schemaType === 'organization' && data.subOrganization) {
        schemaData.subOrganization = data.subOrganization;
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(schemaData)
                }}
            />
            {breadcrumbs && breadcrumbs.length > 0 && (
                <BreadcrumbSchema items={breadcrumbs} id={`breadcrumb-${pageType}`} />
            )}
        </>
    );
};

export default PageSchema; 