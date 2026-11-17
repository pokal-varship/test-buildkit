import { ComponentConfig } from "@measured/puck";
import PopularItemsSection from "./component";
import { popularItemsSectionFields, PopularItemsSectionProps } from "./fields";
import { getPopularProductsFromTypesense } from "@services/popularProducts";
import { getStoreIdBySlugClient } from "@services/storeServiceClient";
import { RESERVED_ROUTES } from "@config/routes.config";
import type { TypesenseProduct } from "@services/typesense/types";

export const PopularItemsSectionConfig: ComponentConfig<PopularItemsSectionProps> = {
  fields: popularItemsSectionFields,
  defaultProps: {
    basicContent: {
      title: "Try our most popular items",
      subtitle: "Treat yourself to our most-try dishes that have gained people talking",
      button: {
        text: "View Full Menu",
        actionType: "url",
        link: "#"
      }
    },
    styling: {
      layout: {
        backgroundColor: "transparent",
        maxWidth: "100%",
        mobile: {
          maxWidth: "100%",
          backgroundColor: "transparent"
        }
      },
      spacing: {
        padding: "40px 0px",
        margin: "0",
        mobile: {
          padding: "24px 16px",
          margin: "0"
        }
      },
      typography: {
        title: {
          fontSize: "40px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.2",
          alignment: "center",
          mobile: {
            fontSize: "24px",
            fontWeight: "600",
            color: "var(--primary-text)",
            lineHeight: "1.2",
            alignment: "center"
          }
        },
        subtitle: {
          fontSize: "16px",
          fontWeight: "500",
          color: "var(--secondary-text)",
          lineHeight: "1.4",
          alignment: "center",
          mobile: {
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--secondary-text)",
            lineHeight: "1.4",
            alignment: "center"
          }
        }
      },
      card: {
        imageHeight: "320px",
        borderRadius: "12px",
        padding: "16px",
        productName: {
          lines: 1,
          fontSize: "16px",
          fontWeight: "600"
        },
        rating: {
          gap: "4px",
          fontSize: "14px",
          fontWeight: "400"
        },
        price: {
          fontSize: "18px",
          fontWeight: "600"
        },
        mobile: {
          imageHeight: "200px",
          borderRadius: "8px",
          padding: "12px",
          productName: {
            lines: 1,
            fontSize: "14px"
          },
          rating: {
            gap: "2px",
            fontSize: "12px",
            fontWeight: "400"
          },
          price: {
            fontSize: "14px",
            fontWeight: "700"
          }
        }
      },
      button: {
        height: "auto",
        width: "auto",
        backgroundColor: "var(--button-primary-background)",
        hoverBackgroundColor: "var(--cta-hover)",
        textColor: "#000000",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        padding: "10px 22px",
        borderColor: "transparent",
        mobile: {
          height: "auto",
          width: "auto",
          backgroundColor: "var(--button-primary-background)",
          hoverBackgroundColor: "var(--cta-hover)",
          textColor: "#000000",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          padding: "10px 22px",
          borderColor: "transparent"
        }
      }
    },
    advanceSettings: {
      slider: {
        showNavigation: true,
        breakpoints: {
          web: {
            slidesPerView: 5.125,
            spaceBetween: 20
          },
          mobile: {
            slidesPerView: 1.2,
            spaceBetween: 15
          }
        },
        limit: 36
      },
      buttonSettings: {
        target: "_self",
        rel: "noopener noreferrer",
        showButton: true,
        variant: "filled"
      },
      accessibility: {
        ariaLabel: "Popular items section",
        role: "region"
      },
      searchQuery: "*",
      searchBy: "name,description,productCategoryName.en",
      filterBy: "status:=ACTIVE",
      sortBy: "",
      storeId: "",
      loading: false,
      error: null
    }
  },
  resolveData: async ({ props }) => {
    // Homepage → tenant_id; Store page → store_id (set by app/[storeSlug]/page.tsx)
    let storeId = props.advanceSettings?.storeId;
    if (!storeId && typeof window !== "undefined") {
      const pathname = (window.location.pathname || "").replace(/\/$/, "") || "/";
      const isHomepage = pathname === "/" || pathname === "/edit" || pathname === "/pages/puck";
      if (isHomepage) {
        storeId = process.env.NEXT_PUBLIC_TENANT_ID || "";
      } else {
        const cleanPath = pathname.replace(/\/edit$/, "").replace(/^\/pages\/puck/, "");
        const storeSlug = cleanPath.split("/").filter(Boolean)[0] || "";
        if (storeSlug && !RESERVED_ROUTES.includes(storeSlug) && !storeSlug.includes(".")) {
          const idFromSlug = await getStoreIdBySlugClient(storeSlug);
          if (idFromSlug) storeId = idFromSlug;
        }
      }
    }
    if (!storeId) {
      return {
        props: {
          ...props,
          items: [],
          advanceSettings: {
            ...props.advanceSettings,
            loading: false,
            error: "Store ID is required to load popular products"
          }
        }
      };
    }
    try {
      // 1) Get product IDs from popular-products-storewise 2) Fetch full data via Typesense multi_search
      const limit = props.advanceSettings?.slider?.limit || 12;
      const typesenseProducts = await getPopularProductsFromTypesense(storeId, {
        days: 30,
        skip: 0,
        limit,
      });
      const items: TypesenseProduct[] = typesenseProducts.slice(0, limit);

      return {
        props: {
          ...props,
          items,
          advanceSettings: {
            ...props.advanceSettings,
            loading: false,
            error: null
          }
        }
      };
    } catch (error) {
      return {
        props: {
          ...props,
          items: [],
          advanceSettings: {
            ...props.advanceSettings,
            loading: false,
            error: `Failed to load products: ${error instanceof Error ? error.message : "Unknown error"}`
          }
        }
      };
    }
  },
  render: PopularItemsSection,
  label: "Popular Items",
};

export type { PopularItemsSectionProps } from "./fields";
export default PopularItemsSectionConfig; 