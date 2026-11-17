import type { Data } from "@measured/puck";
import AboutUsClient from "./AboutUsClient";
import { Metadata } from "next";
import { getTeamMembersDataServer } from "@services/about-us";
import { getPageDraft } from "services/pageManagement";
import { getTenantConfig } from "@config/tenant.config";
import BreadcrumbSchema from "@components/schema/BreadcrumbSchema";
import { cookies } from 'next/headers';
import { fetchGuestTokenServer } from '@services/guestToken';
import PageSuspense from '@components/PageSuspense';

// Enable Incremental Static Regeneration (ISR)
// This tells Next.js to cache the page for 15 minutes and then revalidate
// Note: Since this page uses cookies(), it's dynamic, but ISR will still cache and revalidate
export const revalidate = 900; // Revalidate every 15 minutes

// Note: generateStaticParams is NOT needed here because this is a static route (/about-us)
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

  // Load About Us draft content server-side
  // Authorization is handled automatically by axiosClient
  let data: Data | null = null;
  try {
    const draftResult = await getPageDraft('/about-us', accessToken, false);
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
  const canonicalUrl = props.metaTags?.canonical || `${baseUrl}/about-us`;

  // Default image for social media
  const defaultImage = `${baseUrl}/images/og-image.jpg`;

  const metadata: Metadata = {
    title: props.metaTags?.title || `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
    description: props.metaTags?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    keywords: props.metaTags?.keywords || `about us, ${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant`,
    authors: [{ name: props.metaTags?.author || process.env.NEXT_PUBLIC_APP_NAME || "" }],
    publisher: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "", 
    robots: props.metaTags?.robots || "index, follow",
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph tags
    openGraph: {
      title: props.openGraph?.title || props.metaTags?.title || `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
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
          alt: props.openGraph?.imageAlt || props.metaTags?.title || `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}`,
        },
      ],
    },

    // Twitter Card tags
    twitter: {
      card: (props.twitterCard?.card as 'summary' | 'summary_large_image' | 'app' | 'player') || "summary_large_image",
      title: props.twitterCard?.title || props.openGraph?.title || props.metaTags?.title || `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      description: props.twitterCard?.description || props.openGraph?.description || props.metaTags?.description || process.env.NEXT_PUBLIC_APP_OG_DESC || "",
      site: props.twitterCard?.site || process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
      creator: props.twitterCard?.creator || process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
      images: [
        {
          url: props.twitterCard?.image || props.openGraph?.image || defaultImage,
          alt: props.twitterCard?.imageAlt || props.openGraph?.imageAlt || props.metaTags?.title || `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}`,
        },
      ],
    },

    // Additional meta tags for better SEO
    other: {
      'theme-color': props.additionalTags?.themeColor || "#000000",
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': props.metaTags?.title || `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
      'application-name': props.metaTags?.title || `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
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

// Server Component - about-us page that renders published content only
async function AboutUsPage() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('token')?.value;
  if (!accessToken) {
    accessToken = await fetchGuestTokenServer();
  }

  try {
    // Fetch draft data server-side for initial render
    // Caching and request deduplication are handled in getPageDraft service
    let draftData: Data | null = null;
    try {
      const draftResult = await getPageDraft('/about-us', accessToken, false);
      if (draftResult?.success && draftResult?.data) {
        // Extract the data properly - draftResult.data is already the Puck Data structure
        draftData = draftResult?.data;
      }
    } catch {
      // Silently fail - will return null
    }
    
    // Ensure data has required structure (content and root) for Puck
    const publishedData: Data | null = draftData
      ? { 
          ...draftData,
          content: draftData?.content || [],
          root: draftData?.root || {}
        }
      : null;

    // If no data found, show placeholder
    if (!publishedData) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#282828',
            marginBottom: '12px'
          }}>
            No Data Found
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#757575',
            margin: 0
          }}>
            No draft data is available for the About Us page. Please create content first.
          </p>
        </div>
      );
    }

    // If MeetOurTeamSection exists, fetch and inject dynamic resolvedData
    if (publishedData && Array.isArray(publishedData?.content)) {
      const meetOurTeamSection = publishedData.content.find(
        (section) => section.type === "MeetOurTeam"
      );
      if (meetOurTeamSection) {
        try {
          // Use server-side function that doesn't access cookies
          const result = await getTeamMembersDataServer() as {
            data: Array<{
              _id?: string;
              firstName?: string;
              lastName?: string;
              role?: string;
              imageUrl?: string;
              socialUrl?: {
                facebookUrl?: string;
                twitterUrl?: string;
                linkedinUrl?: string;
                instagramUrl?: string;
                [key: string]: string | undefined;
              };
            }>;
          };
          const teamMembers = result.data || [];
          
          // Only set resolvedData if we have team members
          // If empty array or 204 status, don't set resolvedData (component will hide itself)
          if (teamMembers && teamMembers.length > 0) {
            // Transform the data to match the expected format
            const transformedTeamMembers = teamMembers.map((member, index: number) => ({
              id: member._id || `member-${index}`,
              name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
              designation: member.role || 'Team Member',
              image: member.imageUrl || 'https://via.placeholder.com/300x220/e5e5e5/999999?text=Team+Member',
              socialUrl: member.socialUrl || undefined
            }));

            meetOurTeamSection.props.resolvedData = {
              teamMembers: transformedTeamMembers,
              loading: false,
              error: null,
              totalCount: teamMembers.length
            };
          }
          // If empty, don't set resolvedData - component will check and hide itself
        } catch {
          // Don't set resolvedData on error - component will hide itself
        }
      }
    }

    // Breadcrumb schema for About Us page
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || '';
    const breadcrumbs = [
      {
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        position: 2,
        name: "About Us",
        item: `${baseUrl}/about-us`
      }
    ];

    // Pass the data to the client component
    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} id="breadcrumb-about-us" />
        <AboutUsClient data={publishedData} />
      </>
    );
  } catch {
    // Error handled silently, return fallback UI
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'var(--heading-h2)',
          fontWeight: 600,
          color: '#282828',
          marginBottom: '12px'
        }}>
          Content Loading
        </h1>
        <p style={{
          fontSize: 'var(--description-font)',
          color: '#757575',
          margin: 0
        }}>
          Content is loading...
        </p>
      </div>
    );
  }
}

export default async function AboutUsPageSuspense() {
  return (
    <>
      <PageSuspense><AboutUsPage /></PageSuspense>
    </>
  );
} 