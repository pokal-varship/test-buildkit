import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { Data } from "@measured/puck";

import { validateStoreSlug } from '@services/storeService';
import { getPageDraft } from 'services/pageManagement';
import { fetchGuestTokenServer } from '@services/guestToken';
import { getTenantConfig } from '@config/tenant.config';
import { isReservedRoute } from '@config/routes.config';

import { testimonialsDataContext } from "pageEditor/contexts/testimonialsDataContext";
import { TestimonialsSectionProps } from "pageEditor/components/TestimonialsSection/fields";

import PageSuspense from '@components/PageSuspense';
import PuckClientRendererWithDraft from "@components/PuckClientRendererWithDraft";
import PageSchema from 'schema/PageSchema';
import { generateBreadcrumbs } from '@lib/breadcrumbHelper';

// Define proper types for store data
interface StoreData {
    slug?: string;
    name?: string;
    telephone?: string;
    address?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
}

interface VisitUsResolvedData {
    storeData: {
        data: StoreData[];
    } | null;
    loading: boolean;
    error: string | null;
}

interface VisitUsSection {
    type: string;
    props: {
        advanceSettings?: {
            coordinates?: {
                latitude?: number;
                longitude?: number;
            };
        };
        resolvedData?: VisitUsResolvedData;
    };
}

export const revalidate = 900;

// Helper function to validate store slug pattern
function isValidStoreSlugPattern(slug: string): boolean {
    // Check if slug contains dots (like com.chrome.devtools or file.json)
    if (slug.includes('.')) {
        return false;
    }
    // Check if it's empty
    if (!slug || slug.trim() === '') {
        return false;
    }
    return true;
}

// Generate metadata for SEO
export async function generateMetadata({
    params,
}: {
    params: Promise<{ storeSlug: string }>;
}): Promise<Metadata> {
    const { storeSlug } = await params;
    
    // Quick validation before API call
    if (!isValidStoreSlugPattern(storeSlug) || isReservedRoute(storeSlug)) {
        return {
            title: "Page Not Found",
            description: "The requested page could not be found",
        };
    }

    try {
        const config = getTenantConfig();
        let accessToken: string | undefined;
        
        try {
            const cookieStore = await cookies();
            accessToken = cookieStore.get('token')?.value;
        } catch {
            // Cookies not available during static generation
        }
        
        if (!accessToken) {
            try {
                accessToken = await fetchGuestTokenServer();
            } catch {
                // Continue without token
            }
        }

        // Validate store slug
        const { isValid, store } = await validateStoreSlug(storeSlug, accessToken);
        
        if (!isValid || !store) {
            return {
                title: "Page Not Found",
                description: "The requested store page could not be found",
            };
        }

        const baseUrl = config?.webUrl || process.env.NEXT_PUBLIC_WEBSITE_URL || '';
        const storeName = store.name || 'Store';
        const storeAddress = store.address?.address || '';

        // Get metadata base URL as URL object if available
        const metadataBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL 
            ? new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL) 
            : undefined;

        return {
            title: `${storeName} | ${config?.appName || 'Restaurant'}`,
            description: `Visit ${storeName} at ${storeAddress}. Order online for pickup or delivery.`,
            metadataBase: metadataBaseUrl,
            publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
            alternates: {
                canonical: `${baseUrl}/${storeSlug}`,
            },
            openGraph: {
                title: `${storeName} | ${config?.appName || 'Restaurant'}`,
                description: `Visit ${storeName} at ${storeAddress}. Order online for pickup or delivery.`,
                url: `${baseUrl}/${storeSlug}`,
                type: 'website',
            },
        };
    } catch {
        return {
            title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "Store",
            description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
        };
    }
}

// Server Component - Store landing page (combines validation and rendering like homepage)
async function StoreLandingPage({
    storeSlug,
}: {
    storeSlug: string;
}) {
    const config = getTenantConfig();
    const baseUrl = config?.webUrl || "";
    
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('token')?.value;
    
    if (!accessToken) {
        accessToken = await fetchGuestTokenServer();
    }

    // Validate store slug against API (single validation, no duplicate call)
    const { isValid, store } = await validateStoreSlug(storeSlug, accessToken);

    if (!isValid || !store) {
        return notFound();
    }

    try {
        // Fetch published page content for this store slug
        let draftData: Data | null = null;
        try {
            const draftResult = await getPageDraft(`/${storeSlug}`, accessToken, false);
            if (draftResult?.success && draftResult?.data) {
                draftData = draftResult?.data;
            }
        } catch {
            // No draft data found - will show empty state
        }

        const publishedData: Data | null = draftData
            ? {
                ...draftData,
                content: draftData?.content || [],
                root: draftData?.root || {}
            }
            : null;

        // If no page data exists, show empty state with create option
        if (!publishedData || !publishedData.content || publishedData.content.length === 0) {
            return (
                <div className="store-landing-page">
                    <div className="container mx-auto px-4 py-16 text-center">
                        <h1 className="text-3xl font-bold mb-4">{store.name}</h1>
                        <p className="text-gray-600 mb-2">{store.address?.address}</p>
                        <p className="text-gray-500 mb-8">
                            This store landing page hasn&apos;t been set up yet.
                        </p>
                        <a 
                            href={`/${storeSlug}/edit`}
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Create Store Landing Page
                        </a>
                    </div>
                    <style>{`
                        .store-landing-page {
                            font-family: var(--font-family);
                            background-color: var(--background-home-page);
                            min-height: 50vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    `}</style>
                </div>
            );
        }

        // Resolve dynamic component data (VisitUs, Testimonials)
        let visitUsSection: VisitUsSection | null = null;

        if (publishedData && Array.isArray(publishedData.content)) {
            visitUsSection = publishedData.content.find(
                (section) => section?.type === "VisitUs"
            ) as VisitUsSection | null;

            if (visitUsSection) {
                // Use the already-fetched store data directly instead of making another API call
                // This avoids redundant getTenantStore calls since we already have the store from validateStoreSlug
                visitUsSection.props.resolvedData = {
                    storeData: {
                        data: [store as unknown as StoreData]
                    },
                    loading: false,
                    error: null
                };
            }

            const testimonialsSection = publishedData.content.find(
                (section) => section?.type === "Testimonials"
            );
            if (testimonialsSection) {
                try {
                    const resolvedData = await testimonialsDataContext.getResolvedData(
                        testimonialsSection.props as TestimonialsSectionProps,
                        accessToken,
                        store?.id
                    );
                    testimonialsSection.props.resolvedData = resolvedData;
                } catch {
                    testimonialsSection.props.resolvedData = {
                        testimonials: [],
                        loading: false,
                        error: "Failed to load testimonials",
                        totalReviews: 0
                    };
                }
            }

            // Pass store id so Popular Items resolveData can call API with tenant_id=storeId (no extra server call)
            const popularItemsSection = publishedData.content.find(
                (section) => section?.type === "PopularItemsSection"
            );
            if (popularItemsSection?.props && store?.id) {
                popularItemsSection.props = {
                    ...popularItemsSection.props,
                    advanceSettings: {
                        ...(popularItemsSection.props as { advanceSettings?: Record<string, unknown> }).advanceSettings,
                        storeId: store.id,
                    },
                };
            }
        }

        // Generate breadcrumbs: Home > Store Name
        const breadcrumbs = generateBreadcrumbs({
            baseUrl: baseUrl,
            storeSlug: storeSlug,
            storeName: store.name || 'Store',
        });

        // Restaurant schema for this store
        const restaurants = [{
            "@type": "Restaurant" as const,
            name: store.name || 'Store',
            telephone: "+91 98765 43210", // Default phone
            hasMenu: `${baseUrl}/${storeSlug}`,
            address: {
                "@type": "PostalAddress" as const,
                streetAddress: store.address?.address || "",
                addressLocality: store.address?.city || "",
                addressRegion: store.address?.state || "",
                postalCode: store.address?.zipCode || "",
                addressCountry: store.address?.country || ""
            },
            geo: store.address?.coordinates ? {
                "@type": "GeoCoordinates" as const,
                longitude: store.address.coordinates.longitude,
                latitude: store.address.coordinates.latitude
            } : undefined,
            url: `${baseUrl}/${storeSlug}`,
        }];

        return (
            <>
                <PageSchema
                    schemaType="organization"
                    pageType="custom"
                    data={{
                        name: store.name || config?.appName || "",
                        url: `${baseUrl}/${storeSlug}`,
                        logo: config?.lightLogoUrl || `https://photos.plateaway.com/plateaway/tenants/tenant-logo.png`,
                        keywords: [],
                    }}
                    restaurants={restaurants}
                    breadcrumbs={breadcrumbs}
                />
                <div className="store-landing-page">
                    <PuckClientRendererWithDraft
                        data={publishedData}
                    />
                    <style>{`
                        .store-landing-page {
                            font-family: var(--font-family);
                            background-color: var(--background-home-page);
                        }
                    `}</style>
                </div>
            </>
        );
    } catch {
        return (
            <div className="store-landing-page">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-center mb-4">{store.name}</h1>
                    <p className="text-center text-gray-600">Content is loading...</p>
                </div>
                <style>{`
                    .store-landing-page {
                        font-family: var(--font-family);
                        background-color: var(--background-home-page);
                    }
                `}</style>
            </div>
        );
    }
}

// Main page component - follows homepage pattern (validation happens inside StoreLandingPage)
export default async function StoreLandingPageWrapper({
    params,
}: {
    params: Promise<{ storeSlug: string }>;
}) {
    const { storeSlug } = await params;

    // Quick validation for invalid patterns (no API call)
    if (!isValidStoreSlugPattern(storeSlug)) {
        return notFound();
    }

    // Check if it's a reserved route (no API call)
    if (isReservedRoute(storeSlug)) {
        return notFound();
    }

    // Validation against API happens inside StoreLandingPage (single call)
    return (
        <PageSuspense>
            <StoreLandingPage storeSlug={storeSlug} />
        </PageSuspense>
    );
}
