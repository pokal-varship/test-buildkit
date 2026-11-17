import LocationsClient from '@components/homepage/HomePage';
import { HomePageData, HomePageLocationData } from '@components/type/home.type';
import { getPageConfig } from '@services/homePage';
import { SEO } from 'types/metadata.type';
import PageSuspense from '@components/PageSuspense';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { fetchGuestTokenServer } from '@services/guestToken';
import { getMetaDatBaseUrl } from '@lib/helper';
import { getTenantConfig } from '@config/tenant.config';
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';

export const revalidate = 1800; // Revalidate every 15 mins (1800 seconds)

const getCachedPageConfig = unstable_cache(async (pageType: string, token: string | undefined) => {
    try {
        return await getPageConfig(pageType, token) as HomePageData;
    } catch {

        return null;
    }
}, ['home'], { revalidate: 1800, tags: ['home'] });

// Generate metadata for SEO
export async function generateMetadata(): Promise<SEO> {
    const config = getTenantConfig();
    const cookieStore = await cookies()
    let accessToken = cookieStore.get('token')?.value
    if (!accessToken) {
        accessToken = await fetchGuestTokenServer()
    }
    const homePageData: HomePageData | null = await getCachedPageConfig('HOME', accessToken) as HomePageData; // Fetch data
    return {
        metaTitle: homePageData?.data?.seo?.metaTitle || "",
        metaDescription: homePageData?.data?.seo?.metaDescription || "",
        title: homePageData?.data?.seo?.metaTitle || "",
        description: homePageData?.data?.seo?.metaDescription || "",
        keywords: homePageData?.data?.seo?.keywords || [],
        robots: homePageData?.data?.seo?.robots || "",
        metadataBase: getMetaDatBaseUrl(),
        publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
        alternates: {
            canonical: homePageData?.data?.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_WEBSITE_URL || ''}/menu`,
        },
        openGraph: {
            title: homePageData?.data?.seo?.openGraph?.title || "",
            description: homePageData?.data?.seo?.openGraph?.description || "",
            images: homePageData?.data?.seo?.openGraph?.image || config?.lightLogoUrl || config?.darkLogoUrl || "",
            type: (homePageData?.data?.seo?.openGraph?.type as 'website') || ""
        },
        structuredData: homePageData?.data?.seo?.structuredData ? {
            type: homePageData?.data?.seo?.structuredData?.type || "",
            properties: {
                name: homePageData?.data?.seo?.structuredData?.properties?.name || "",
                url: homePageData?.data?.seo?.structuredData?.properties?.url || process.env.NEXT_PUBLIC_WEBSITE_URL || "",
            },
        } : {
            properties: {
                name: "",
                url: "",
            },
            type: "",
        }
    };
}

// Server Component - root homepage that uses the original content
async function HomePage() {
    const cookieStore = await cookies()
    let accessToken = cookieStore.get('token')?.value
    if (!accessToken) {
        accessToken = await fetchGuestTokenServer()
    }
    const homePageData = await getCachedPageConfig('HOME', accessToken);
    if (!homePageData) return null;
    
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || '';
    const breadcrumbs = [
        {
            position: 1,
            name: "Home",
            item: baseUrl
        },
        {
            position: 2,
            name: "Menu",
            item: `${baseUrl}/menu`
        }
    ];
    
    return (
        <>
            <BreadcrumbSchema items={breadcrumbs} id="breadcrumb-menu" />
            <div className="home-page">
                <LocationsClient homePageData={homePageData as HomePageLocationData} />
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

export default async function HomePageSuspense() {
    return <PageSuspense><HomePage /></PageSuspense>;
} 