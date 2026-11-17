import type { Data } from "@measured/puck";
import EventGrid from '@components/event/EventGrid';
import { Metadata } from "next";
import { getPageDraft } from "services/pageManagement";
import { getTenantConfig } from "@config/tenant.config";
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';
import { cookies } from 'next/headers';
import { fetchGuestTokenServer } from '@services/guestToken';
import PageSuspense from '@components/PageSuspense';

// Enable Incremental Static Regeneration (ISR)
// This tells Next.js to cache the page for 15 minutes and then revalidate
// Note: Since this page uses cookies(), it's dynamic, but ISR will still cache and revalidate
export const revalidate = 900; // Revalidate every 15 minutes

// Note: generateStaticParams is NOT needed here because this is a static route (/events)
// generateStaticParams is only for dynamic routes like [slug] or [...puckPath]

export async function generateMetadata(): Promise<Metadata> {
  const config = getTenantConfig();
  // Try to get cookies, but handle the case where they're not available during static generation
  let accessToken: string | undefined;
  try {
    const cookieStore = await cookies();
    accessToken = cookieStore.get('token')?.value;
  } catch {
    // Cookies not available during static generation, continue without token
  }
  
  if (!accessToken) {
    try {
      accessToken = await fetchGuestTokenServer();
    } catch {
      // Error handled silently, continue without token
    }
  }

  // Load Events draft content server-side
  // Authorization is handled automatically by axiosClient
  let data: Data | null = null;
  try {
    const draftResult = await getPageDraft('/events', accessToken, false);
    if (draftResult?.success && draftResult?.data) {
      data = draftResult.data;
    }
  } catch {
    // Silently fail - will return null
  }
  
  // If no draft data found, use minimal defaults for metadata only
  const root = data?.root;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (root?.props as any) || {};

  // Construct the canonical URL using environment variable
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || '';
  const canonicalUrl = props.metaTags?.canonical || `${baseUrl}/events`;

  // Default image for social media
  const defaultImage = `${baseUrl}/images/og-image.jpg`;

  const metadata: Metadata = {
    title: props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
    description: props.metaTags?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    keywords: props.metaTags?.keywords || `events, ${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant events`,
    authors: [{ name: props.metaTags?.author || process.env.NEXT_PUBLIC_APP_NAME || "" }],
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "", 
    robots: props.metaTags?.robots || "index, follow",
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph tags
    openGraph: {
      title: props.openGraph?.title || props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      description: props.openGraph?.description || props.metaTags?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
      url: canonicalUrl,
      siteName: props.openGraph?.siteName || process.env.NEXT_PUBLIC_APP_NAME || "",
      type: (props.openGraph?.type as 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other') || "website",
      locale: props.openGraph?.locale || "en_US",
      images: [
        {
          url: props.openGraph?.image || defaultImage,
          width: parseInt(props.openGraph?.imageWidth || "1200"),
          height: parseInt(props.openGraph?.imageHeight || "630"),
          alt: props.openGraph?.imageAlt || props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_NAME || ""}`,
        },
      ],
    },

    // Twitter Card tags
    twitter: {
      card: (props.twitterCard?.card as 'summary' | 'summary_large_image' | 'app' | 'player') || "summary_large_image",
      title: props.twitterCard?.title || props.openGraph?.title || props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      description: props.twitterCard?.description || props.openGraph?.description || props.metaTags?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
      site: props.twitterCard?.site || process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
      creator: props.twitterCard?.creator || process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
      images: [
        {
          url: props.twitterCard?.image || props.openGraph?.image || defaultImage,
          alt: props.twitterCard?.imageAlt || props.openGraph?.imageAlt || props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_NAME || ""}`,
        },
      ],
    },

    // Additional meta tags for better SEO
    other: {
      'theme-color': props.additionalTags?.themeColor || "#000000",
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      'application-name': props.metaTags?.title || `Events - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      'msapplication-TileColor': props.additionalTags?.themeColor || "#000000",
      'format-detection': 'telephone=no',
    } as Record<string, string>,

    // Verification meta tags (if needed)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },

    // Icons
    icons: {
      icon: props.additionalTags?.favicon || "/favicon.ico",
      apple: props.additionalTags?.appleTouchIcon || "/apple-touch-icon.png",
    },

    // Manifest
    manifest: props.additionalTags?.manifest || "/manifest.json",
  };

  // Add structured data if available
  if (props.structuredData) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": props.structuredData?.type || "",
      "name": props.structuredData.name || process.env.NEXT_PUBLIC_APP_NAME || "",
      "description": props.structuredData?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
      "url": props.structuredData.url || canonicalUrl,
      "logo": props.structuredData?.logo || config?.lightLogoUrl || config?.darkLogoUrl || "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": props.structuredData.address?.streetAddress || "",
        "addressLocality": props.structuredData.address?.addressLocality || "",
        "addressRegion": props.structuredData.address?.addressRegion || "",
        "postalCode": props.structuredData.address?.postalCode || "",
        "addressCountry": props.structuredData.address?.addressCountry || ""
      },
      "telephone": props.structuredData?.telephone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
      "email": props.structuredData?.email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
      "priceRange": props.structuredData?.priceRange || "",
      "servesCuisine": props.structuredData?.servesCuisine || [],
      "acceptsReservations": props.structuredData?.acceptsReservations || "",
      "paymentAccepted": props.structuredData?.paymentAccepted || []
    };

    // Add structured data to other metadata
    const currentOther = metadata.other as Record<string, string> || {};
    metadata.other = {
      ...currentOther,
      'structured-data': JSON.stringify(structuredData),
    };
  }

  return metadata;
}

// Server Component - events page that renders published content only
async function EventsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || '';
  const breadcrumbs = [
    {
      position: 1,
      name: "Home",
      item: baseUrl
    },
    {
      position: 2,
      name: "Events",
      item: `${baseUrl}/events`
    }
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} id="breadcrumb-events" />
      <EventGrid />
    </>
  );
}

export default async function EventsPageSuspense() {
  return (
    <>
      <PageSuspense><EventsPage /></PageSuspense>
    </>
  );
}
