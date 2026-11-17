import type { Fields } from "@measured/puck";

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  viewport: string;
  charset: string;
}

export interface OpenGraph {
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
}

export interface TwitterCard {
  card: string;
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface Address {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface StructuredData {
  type: string;
  name: string;
  description: string;
  url: string;
  logo: string;
  address: Address;
  telephone: string;
  email: string;
  priceRange: string;
  servesCuisine: string[];
  acceptsReservations: boolean;
  paymentAccepted: string[];
}

export interface HreflangItem {
  hreflang: string;
  href: string;
}

export interface AdditionalTags {
  themeColor: string;
  appleTouchIcon: string;
  favicon: string;
  manifest: string;
  hreflang: HreflangItem[];
}

export interface SeoData {
  metaTags: MetaTags;
  openGraph: OpenGraph;
  twitterCard: TwitterCard;
  structuredData: StructuredData;
  additionalTags: AdditionalTags;
}

export const seoFields: Fields = {
  metaTags: {
    type: "object",
    label: "Meta Tags",
    objectFields: {
      title: {
        type: "text",
        label: "Title",
        placeholder: "Enter page title",
      },
      description: {
        type: "textarea",
        label: "Description",
        placeholder: "Enter meta description",
      },
      keywords: {
        type: "text",
        label: "Keywords",
        placeholder: "Enter keywords separated by commas",
      },
      author: {
        type: "text",
        label: "Author",
        placeholder: "Enter author name",
      },
      robots: {
        type: "select",
        label: "Robots",
        options: [
          { label: "Index, Follow", value: "index, follow" },
          { label: "No Index, No Follow", value: "noindex, nofollow" },
          { label: "Index, No Follow", value: "index, nofollow" },
          { label: "No Index, Follow", value: "noindex, follow" },
        ],
      },
      canonical: {
        type: "text",
        label: "Canonical URL",
        placeholder: "Enter canonical URL",
      },
      viewport: {
        type: "text",
        label: "Viewport",
        placeholder: "width=device-width, initial-scale=1.0",
      },
      charset: {
        type: "text",
        label: "Character Set",
        placeholder: "UTF-8",
      },
    },
  },
  openGraph: {
    type: "object",
    label: "Open Graph (Facebook)",
    objectFields: {
      title: {
        type: "text",
        label: "OG Title",
        placeholder: "Enter Open Graph title",
      },
      description: {
        type: "textarea",
        label: "OG Description",
        placeholder: "Enter Open Graph description",
      },
      type: {
        type: "select",
        label: "OG Type",
        options: [
          { label: "Website", value: "website" },
          { label: "Article", value: "article" },
          { label: "Product", value: "product" },
        ],
      },
      url: {
        type: "text",
        label: "OG URL",
        placeholder: "Enter Open Graph URL",
      },
      image: {
        type: "text",
        label: "OG Image",
        placeholder: "Enter Open Graph image URL",
      },
      imageAlt: {
        type: "text",
        label: "OG Image Alt",
        placeholder: "Enter image alt text",
      },
      imageWidth: {
        type: "text",
        label: "OG Image Width",
        placeholder: "1200",
      },
      imageHeight: {
        type: "text",
        label: "OG Image Height",
        placeholder: "630",
      },
      siteName: {
        type: "text",
        label: "Site Name",
        placeholder: "Enter site name",
      },
      locale: {
        type: "text",
        label: "Locale",
        placeholder: "en_US",
      },
    },
  },
  twitterCard: {
    type: "object",
    label: "Twitter Card",
    objectFields: {
      card: {
        type: "select",
        label: "Card Type",
        options: [
          { label: "Summary Large Image", value: "summary_large_image" },
          { label: "Summary", value: "summary" },
          { label: "App", value: "app" },
          { label: "Player", value: "player" },
        ],
      },
      site: {
        type: "text",
        label: "Twitter Site",
        placeholder: "@username",
      },
      creator: {
        type: "text",
        label: "Twitter Creator",
        placeholder: "@username",
      },
      title: {
        type: "text",
        label: "Twitter Title",
        placeholder: "Enter Twitter card title",
      },
      description: {
        type: "textarea",
        label: "Twitter Description",
        placeholder: "Enter Twitter card description",
      },
      image: {
        type: "text",
        label: "Twitter Image",
        placeholder: "Enter Twitter card image URL",
      },
      imageAlt: {
        type: "text",
        label: "Twitter Image Alt",
        placeholder: "Enter image alt text",
      },
    },
  },
  structuredData: {
    type: "object",
    label: "Structured Data (Schema.org)",
    objectFields: {
      type: {
        type: "select",
        label: "Schema Type",
        options: [
          { label: "Restaurant", value: "Restaurant" },
          { label: "LocalBusiness", value: "LocalBusiness" },
          { label: "Organization", value: "Organization" },
          { label: "WebSite", value: "WebSite" },
        ],
      },
      name: {
        type: "text",
        label: "Business Name",
        placeholder: "Enter business name",
      },
      description: {
        type: "textarea",
        label: "Business Description",
        placeholder: "Enter business description",
      },
      url: {
        type: "text",
        label: "Website URL",
        placeholder: "Enter website URL",
      },
      logo: {
        type: "text",
        label: "Logo URL",
        placeholder: "Enter logo URL",
      },
      address: {
        type: "object",
        label: "Address",
        objectFields: {
          streetAddress: {
            type: "text",
            label: "Street Address",
            placeholder: "Enter street address",
          },
          addressLocality: {
            type: "text",
            label: "City",
            placeholder: "Enter city",
          },
          addressRegion: {
            type: "text",
            label: "State/Region",
            placeholder: "Enter state or region",
          },
          postalCode: {
            type: "text",
            label: "Postal Code",
            placeholder: "Enter postal code",
          },
          addressCountry: {
            type: "text",
            label: "Country",
            placeholder: "Enter country",
          },
        },
      },
      telephone: {
        type: "text",
        label: "Phone Number",
        placeholder: "Enter phone number",
      },
      email: {
        type: "text",
        label: "Email",
        placeholder: "Enter email address",
      },
      priceRange: {
        type: "select",
        label: "Price Range",
        options: [
          { label: "$ (Inexpensive)", value: "$" },
          { label: "$$ (Moderate)", value: "$$" },
          { label: "$$$ (Expensive)", value: "$$$" },
          { label: "$$$$ (Very Expensive)", value: "$$$$" },
        ],
      },
      servesCuisine: {
        type: "array",
        label: "Serves Cuisine",
        arrayFields: {
          cuisine: {
            type: "text",
            label: "Cuisine Type",
            placeholder: "Enter cuisine type",
          },
        },
      },
      acceptsReservations: {
        type: "radio",
        label: "Accepts Reservations",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      paymentAccepted: {
        type: "array",
        label: "Payment Methods",
        arrayFields: {
          method: {
            type: "select",
            label: "Payment Method",
            options: [
              { label: "Cash", value: "Cash" },
              { label: "Credit Card", value: "Credit Card" },
              { label: "Debit Card", value: "Debit Card" },
              { label: "PayPal", value: "PayPal" },
              { label: "Apple Pay", value: "Apple Pay" },
              { label: "Google Pay", value: "Google Pay" },
            ],
          },
        },
      },
    },
  },
  additionalTags: {
    type: "object",
    label: "Additional Tags",
    objectFields: {
      themeColor: {
        type: "text",
        label: "Theme Color",
        placeholder: "#000000",
      },
      appleTouchIcon: {
        type: "text",
        label: "Apple Touch Icon",
        placeholder: "Enter Apple touch icon URL",
      },
      favicon: {
        type: "text",
        label: "Favicon",
        placeholder: "Enter favicon URL",
      },
      manifest: {
        type: "text",
        label: "Web App Manifest",
        placeholder: "Enter manifest URL",
      },
      hreflang: {
        type: "array",
        label: "Hreflang Tags",
        arrayFields: {
          hreflang: {
            type: "text",
            label: "Language Code",
            placeholder: "en-US",
          },
          href: {
            type: "text",
            label: "URL",
            placeholder: "Enter URL for this language",
          },
        },
      },
    },
  },
}; 