import { componentConfigs } from "pageEditor/components";
import { seoFields } from "pageEditor/seo-fields";

// Function to get filtered components based on route (for editor only)
const getFilteredComponents = (path: string) => {
  // For About Us routes, only show specific components
  if (path.includes('about-us')) {
    const filteredComponents = {
      MainBanner: componentConfigs?.MainBanner,
      MediaContent: componentConfigs?.MediaContent,
      OurServices: componentConfigs?.OurServices,
      MeetOurTeam: componentConfigs?.MeetOurTeam,
      PromotionalBanner: componentConfigs?.PromotionalBanner,
      StickyButton: componentConfigs?.StickyButton,
      
    };
    return filteredComponents;
  }
  
  // For home page (root path), exclude MeetOurTeam and PromotionalBanner
  if (path === '/' || path === '/puck' || path === '/puck/') {
    const { MeetOurTeam, PromotionalBanner, ...homePageComponents } = componentConfigs;
    return homePageComponents;
  }
  
  // For all other routes, show all components
  return componentConfigs;
};

// Function to get config based on route (for editor only)
export const getConfig = (path: string) => {
  const filteredComponents = getFilteredComponents(path);
  
  return {
    components: filteredComponents,
    defaultPath: path.includes('about-us') ? '/puck/about-us' : path,
    root: {
      fields: seoFields,
      defaultProps: {
        metaTags: {
          title: path.includes('about-us') ? `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}` : process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
          description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
          keywords: path.includes('about-us') ? `about us, ${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant` : `${process.env.NEXT_PUBLIC_APP_NAME || ""}, restaurant, online food delivery, food delivery app, food delivery service`,
          author: process.env.NEXT_PUBLIC_APP_NAME || "",
          robots: "",
          canonical: "",
          viewport: "width=device-width, initial-scale=1.0",
          charset: "UTF-8"
        },
        openGraph: {
          title: path.includes('about-us') ? `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}` : process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
          description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
          type: "website",
          url: "",
          image: "",
          imageAlt: path.includes('about-us') ? `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}` : process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
          imageWidth: "1200",
          imageHeight: "630",
          siteName: process.env.NEXT_PUBLIC_APP_NAME || "",
          locale: "en_US"
        },
        twitterCard: {
          card: "summary_large_image",
          site: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
          creator: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
          title: path.includes('about-us') ? `About Us - ${process.env.NEXT_PUBLIC_APP_OG_TITLE || ""}` : process.env.NEXT_PUBLIC_APP_OG_TITLE || "",
          description: process.env.NEXT_PUBLIC_APP_OG_DESC || "",
          image: "",
          imageAlt: path.includes('about-us') ? `About ${process.env.NEXT_PUBLIC_APP_NAME || ""}` : process.env.NEXT_PUBLIC_APP_OG_TITLE || ""
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
};

// Default config for published pages (no component filtering)
export const config = {
  components: componentConfigs,
  root: {
    fields: seoFields,
    defaultProps: {
      metaTags: {
        title: "",
        description: "",
        keywords: "",
        author: "",
        robots: "",
        canonical: "",
        viewport: "width=device-width, initial-scale=1.0",
        charset: "UTF-8"
      },
      openGraph: {
        title: "",
        description: "",
        type: "website",
        url: "",
        image: "",
        imageAlt: "",
        imageWidth: "1200",
        imageHeight: "630",
        siteName: "",
        locale: "en_US"
      },
      twitterCard: {
        card: "summary_large_image",
        site: "",
        creator: "",
        title: "",
        description: "",
        image: "",
        imageAlt: ""
      },
      structuredData: {
        type: "Restaurant",
        name: "",
        description: "",
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

export default config;
