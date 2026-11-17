import { HomePageData } from '@components/type/home.type';
import tenantConfig, { getTenantConfig } from '@config/tenant.config';
import { getMetaDatBaseUrl } from '@lib/helper';
import { Data } from "@measured/puck";
import { fetchGuestTokenServer } from '@services/guestToken';
import { getPageConfig } from '@services/homePage';
import { testimonialsDataContext } from "pageEditor/contexts/testimonialsDataContext";
import { TestimonialsSectionProps } from "pageEditor/components/TestimonialsSection/fields";
import { getPageDraft } from "services/pageManagement";
import { homePageSEO } from 'types/metadata.type';
import PageSchema from 'schema/PageSchema';
import PageSuspense from '@components/PageSuspense';
import PuckClientRendererWithDraft from "@components/PuckClientRendererWithDraft";
import { generateBreadcrumbs } from '@lib/breadcrumbHelper';

export const revalidate = 900;

const getPageConfigWithErrorHandling = async (pageType: string, token: string | undefined) => {
    try {
        return await getPageConfig(pageType, token) as HomePageData;
    } catch {
        // Error handled silently
        return null;
    }
};


// Generate metadata for SEO
export async function generateMetadata(): Promise<homePageSEO> {
    try {
        const config = getTenantConfig();
        let accessToken: string | undefined;
        try {
            accessToken = await fetchGuestTokenServer();
        } catch {
            // Error handled silently, continue without token
        }
        
        let homePageData: HomePageData | null = null;
        try {
            homePageData = await getPageConfigWithErrorHandling('HOME', accessToken) as HomePageData;
        } catch {
            // Error handled silently, continue with null data
        }
        
        const structuredData = homePageData?.data?.seo?.structuredData;
        const openGraphType = homePageData?.data?.seo?.openGraph?.type;
        
        // Validate OpenGraph type to prevent JSON parsing errors
        const validOpenGraphType = openGraphType && ['website', 'article', 'book', 'profile'].includes(openGraphType) 
            ? openGraphType as 'website' 
            : 'website';

        return {
            metaTitle: homePageData?.data?.seo?.metaTitle || process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
            metaDescription: homePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
            title: homePageData?.data?.seo?.metaTitle || process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
            description: homePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
            keywords: homePageData?.data?.seo?.keywords || [],
            robots: homePageData?.data?.seo?.robots || "",
            metadataBase: getMetaDatBaseUrl(),
            publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
            alternates: {
                canonical: homePageData?.data?.seo?.canonicalUrl || process.env.NEXT_PUBLIC_WEBSITE_URL || '',
            },
            openGraph: {
                title: homePageData?.data?.seo?.openGraph?.title || process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
                description: homePageData?.data?.seo?.openGraph?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
                images: homePageData?.data?.seo?.openGraph?.image || config?.lightLogoUrl || config?.darkLogoUrl || "",
                type: validOpenGraphType
            },
            structuredData: structuredData ? {
                type: structuredData?.type || "",
                properties: {
                    context: "https://schema.org",
                    name: structuredData?.properties?.name || process.env.NEXT_PUBLIC_APP_NAME || "",
                    description: homePageData?.data?.seo?.metaDescription || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
                    url: structuredData?.properties?.url || process.env.NEXT_PUBLIC_WEBSITE_URL || "",
                    potentialAction: {
                        type: "SearchAction",
                        target: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string"
                    }
                }
            } : undefined
        };
    } catch {
        // Error handled silently, return fallback metadata to prevent page crash
        return {
            metaTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
            metaDescription: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
            title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
            description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
            keywords: [],
            robots: "",
            metadataBase: getMetaDatBaseUrl(),
            publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
            alternates: {
                canonical: process.env.NEXT_PUBLIC_WEBSITE_URL || '',
            },
            openGraph: {
                title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
                description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
                images: "",
                type: "website"
            }
        };
    }
}

// Server Component - homepage that renders published content only
async function HomePage() {
    const config = getTenantConfig();
    const baseUrl = config.webUrl || "";
    let accessToken: string | undefined;
    try {
        accessToken = await fetchGuestTokenServer();
    } catch {
        // Error handled silently
    }
    const homePageData: HomePageData | null = await getPageConfigWithErrorHandling('HOME', accessToken) as HomePageData;
    try {
        let draftData: Data | null = null;
        try {
            const draftResult = await getPageDraft('/', accessToken, false);
            if (draftResult?.success && draftResult?.data) {
                draftData = draftResult?.data;
            }
        } catch {
        }
        const publishedData: Data | null = draftData
            ? { 
                ...draftData,
                content: draftData?.content || [],
                root: draftData?.root || {}
              }
            : null;

        if (publishedData && Array.isArray(publishedData.content)) {
            // VisitUs data is now fetched client-side in VisitUsSection/component.tsx
            // using cookies for coordinates — keeps this page ISR-compatible.
            const testimonialsSection = publishedData.content.find(
                (section) => section?.type === "Testimonials"
            );
            if (testimonialsSection) {
                try {
                    const resolvedData = await testimonialsDataContext.getResolvedData(
                        testimonialsSection.props as TestimonialsSectionProps, 
                        accessToken
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
        }
        if (publishedData) {
            // VisitUs store data is fetched client-side — use empty array for schema
            const restaurants: never[] = [];

            // Generate breadcrumbs for homepage (just "Home")
            const breadcrumbs = generateBreadcrumbs({
                baseUrl: baseUrl
            });

            return (
                <>
                    <PageSchema 
                        schemaType="organization" 
                        pageType="home"
                        data={{
                            name: tenantConfig?.appName || "",
                            url: baseUrl,
                            logo: config?.lightLogoUrl || `https://photos.plateaway.com/plateaway/tenants/tenant-logo.png`,
                            keywords: homePageData?.data?.seo?.keywords || [],
                        }}
                        restaurants={restaurants}
                        breadcrumbs={breadcrumbs}
                    />
                    <div className="home-page">
                        <PuckClientRendererWithDraft 
                            data={publishedData}
                        />
                        <style>{`
                            .home-page {
                                font-family: var(--font-family);
                                background-color: var(--background-home-page);
                            }
                        `}</style>
                    </div>
                </>
            );
        }
        return null;
    } catch {
        // Error handled silently, return fallback UI
        return (
            <div className="home-page">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold text-center mb-4">Welcome</h1>
                    <p className="text-center text-gray-600">Content is loading...</p>
                </div>
                <style>{`
                    .home-page {
                        font-family: var(--font-family);
                        background-color: var(--background-home-page);
                    }
                `}</style>
            </div>
        );
    }
}

export default async function HomePageSuspense() {
  
    return (
        <>
            <PageSuspense><HomePage /></PageSuspense>
        </>
    );
}
