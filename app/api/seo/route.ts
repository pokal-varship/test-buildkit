import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SeoData {
  metaTags: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    robots: string;
    canonical: string;
    viewport: string;
    charset: string;
  };
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    image: string;
    imageAlt: string;
    imageWidth: string;
    imageHeight: string;
    siteName: string;
    locale: string;
  };
  twitterCard: {
    card: string;
    site: string;
    creator: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  structuredData: {
    type: string;
    name: string;
    description: string;
    url: string;
    logo: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    telephone: string;
    email: string;
    priceRange: string;
    servesCuisine: string[];
    acceptsReservations: boolean;
    paymentAccepted: string[];
  };
  additionalTags: {
    themeColor: string;
    appleTouchIcon: string;
    favicon: string;
    manifest: string;
    hreflang: Array<{
      hreflang: string;
      href: string;
    }>;
  };
}

// Content item interface for Puck editor
interface ContentItem {
  type: string;
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

// Zones interface for Puck editor
interface Zones {
  [zoneName: string]: ContentItem[];
}

// Legacy database format (current format)
interface LegacyPageData {
  root?: {
    props?: SeoData & { title?: string };
  };
  content?: ContentItem[];
  zones?: Zones;
}

interface LegacyDatabase {
  [slug: string]: LegacyPageData;
}

const DEFAULT_SEO: SeoData = {
  metaTags: {
    title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
    description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    keywords: `${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant, online ordering, fast delivery, quality food`,
    author: process.env.NEXT_PUBLIC_APP_NAME || "",
    robots: "index, follow",
    canonical: "",
    viewport: "width=device-width, initial-scale=1.0",
    charset: "UTF-8"
  },
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
    description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    type: "website",
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || "",
    image: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/images/og-image.jpg`,
    imageAlt: process.env.NEXT_PUBLIC_APP_NAME || "",
    imageWidth: "1200",
    imageHeight: "630",
    siteName: process.env.NEXT_PUBLIC_APP_NAME || "",
    locale: "en_US"
  },
  twitterCard: {
    card: "summary_large_image",
    site: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    creator: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    title: process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
    description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    image: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/images/twitter-image.jpg`,
    imageAlt: process.env.NEXT_PUBLIC_APP_NAME || ""
  },
  structuredData: {
    type: "Restaurant",
    name: process.env.NEXT_PUBLIC_APP_NAME || "",
    description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || "",
    logo: `${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/images/logo.png`,
    address: {
      streetAddress: "123 High Street",
      addressLocality: "London",
      addressRegion: "London",
      postalCode: "SW1A 1AA",
      addressCountry: "GB"
    },
    telephone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    priceRange: "$$",
    servesCuisine: ["International"],
    acceptsReservations: false,
    paymentAccepted: ["Credit Card", "Debit Card", "PayPal", "Apple Pay"]
  },
  additionalTags: {
    themeColor: "#1a365d",
    appleTouchIcon: "/images/apple-touch-icon.png",
    favicon: "/favicon.ico",
    manifest: "/manifest.json",
    hreflang: [
      { hreflang: "en", href: process.env.NEXT_PUBLIC_WEBSITE_URL || "" }
    ]
  }
};

function getDatabasePath(): string {
  return path.join(process.cwd(), 'database.json');
}

function readDatabase(): LegacyDatabase {
  try {
    const dbPath = getDatabasePath();
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch {

    return {};
  }
}

function writeDatabase(db: LegacyDatabase): void {
  try {
    const dbPath = getDatabasePath();
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch {

    throw new Error('Failed to save database');
  }
}

function findSeoData(slug: string, db: LegacyDatabase): SeoData {
  // Try exact match first
  let pageData = db[slug];
  
  // If no exact match, try with /puck prefix
  if (!pageData && !slug.startsWith('/puck')) {
    pageData = db[`/puck${slug}`];
  }
  
  // If still no match and slug is root, try /puck
  if (!pageData && slug === '/') {
    pageData = db['/puck'];
  }

  if (pageData?.root?.props) {
    // Extract SEO data from root.props, excluding the legacy title field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, ...seoProps } = pageData.root.props;
    
    // Merge with defaults to ensure all fields are present
    return {
      metaTags: { ...DEFAULT_SEO.metaTags, ...seoProps.metaTags },
      openGraph: { ...DEFAULT_SEO.openGraph, ...seoProps.openGraph },
      twitterCard: { ...DEFAULT_SEO.twitterCard, ...seoProps.twitterCard },
      structuredData: { ...DEFAULT_SEO.structuredData, ...seoProps.structuredData },
      additionalTags: { ...DEFAULT_SEO.additionalTags, ...seoProps.additionalTags },
    };
  }

  // Return default SEO data
  return DEFAULT_SEO;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || '/';
    
    const db = readDatabase();
    const seoData = findSeoData(slug, db);
    
    return NextResponse.json(seoData);
  } catch {

    return NextResponse.json(
      { error: 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, seoData }: { slug: string; seoData: SeoData } = await request.json();
    
    if (!slug || !seoData) {
      return NextResponse.json(
        { error: 'Slug and SEO data are required' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    
    // Find the page and update its root.props data
    if (!db[slug]) {
      db[slug] = { 
        root: { props: seoData }, 
        content: [], 
        zones: {} 
      };
    } else {
      if (!db[slug].root) {
        db[slug].root = { props: seoData };
      } else {
        db[slug].root!.props = { ...db[slug].root!.props || {}, ...seoData };
      }
    }

    writeDatabase(db);
    
    return NextResponse.json({ success: true });
  } catch {

    return NextResponse.json(
      { error: 'Failed to save SEO data' },
      { status: 500 }
    );
  }
} 