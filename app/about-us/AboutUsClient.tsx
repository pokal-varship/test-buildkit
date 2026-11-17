"use client";

import { Render } from "@measured/puck";
import { componentConfigs } from "pageEditor/components";
import { seoFields } from "pageEditor/seo-fields";
import type { Data } from "@measured/puck";

// About Us specific config with only MediaContent and OurServices
const aboutUsConfig = {
  components: {
    MainBanner: componentConfigs?.MainBanner,
    MediaContent: componentConfigs.MediaContent,
    OurServices: componentConfigs.OurServices,
    MeetOurTeam: componentConfigs?.MeetOurTeam,
    PromotionalBanner: componentConfigs?.PromotionalBanner,
    StickyButton: componentConfigs?.StickyButton,
  },
  defaultPath: '/about-us',
  root: {
    fields: seoFields,
    defaultProps: {
      metaTags: {
        title: `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
        description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
        keywords: `about us, ${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant`,
        author: process.env.NEXT_PUBLIC_PUBLISHER_NAME || "",
        robots: "index, follow",
        canonical: "",
        viewport: "width=device-width, initial-scale=1.0",
        charset: "UTF-8"
      },
      openGraph: {
        title: `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
        description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
        type: "website",
        url: "",
        image: "",
        imageAlt: `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}`,
        imageWidth: "1200",
        imageHeight: "630",
        siteName: process.env.NEXT_PUBLIC_APP_NAME || "",
        locale: "en_US"
      },
      twitterCard: {
        card: "summary_large_image",
        site: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
        creator: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
        title: `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}`,
        description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
        image: "",
        imageAlt: `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}`
      },
      structuredData: {
        type: "Restaurant",
        name: process.env.NEXT_PUBLIC_APP_NAME || "",
        description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
        url: "",
        logo: "",
        address: {
          streetAddress: "",
          addressLocality: "",
          addressRegion: "",
          postalCode: "",
          addressCountry: ""
        },
        telephone: "",
        email: "",
        priceRange: "$$",
        servesCuisine: [],
        acceptsReservations: true,
        paymentAccepted: []
      },
      additionalTags: {
        themeColor: "#000000",
        appleTouchIcon: "",
        favicon: "",
        manifest: "",
        hreflang: []
      }
    }
  }
};

interface AboutUsClientProps {
  data: Data;
}

export default function AboutUsClient({ data }: AboutUsClientProps) {
  return <Render config={aboutUsConfig} data={data} />;
} 