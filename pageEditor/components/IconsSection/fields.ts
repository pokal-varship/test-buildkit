import { CATERING_ICON, DELIVERY_ICON_NEW, DINE_IN_ICON, TAKEAWAY_ICON } from "@config/Header/image.config";

import type { Fields } from "@measured/puck";
import { alignmentOptions, fontWeightOptions } from "pageEditor/commonFields/field";

export interface IconCard {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  iconUrl: string;
  iconSvg: string;
  iconType: 'url' | 'local' | 'svg';
  iconSize: number;
  iconColor: string;
}

export interface IconsSectionProps {
  basicContent?: {
    title?: string;
    subtitle?: string;
    iconCards?: IconCard[];
    enableModal?: boolean;
    showViewMore?: boolean;
    viewMoreText?: string;
  };
  styling?: {
    layout: {
      backgroundColor?: string;
      maxWidth?: string;
    };
    spacing: {
      spacing?: {
        desktop?: {
          padding?: string;
          margin?: string;
        };
        mobile?: {
          padding?: string;
          margin?: string;
        };
      };
    };
    typography: {
      title?: {
        fontSize?: string;
        fontWeight?: string;
        lineHeight?: string;
        color?: string;
        alignment?: "left" | "center" | "right";
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
      };
      subtitle?: {
        fontSize?: string;
        fontWeight?: string;
        lineHeight?: string;
        color?: string;
        alignment?: "left" | "center" | "right";
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
      };
     },
    grid: {
      columns?: number;
      spacing?: number;
      mobileColumns?: number;
      mobileSpacing?: number;
    };
    card: {
      title?: {
        color?: string;
        fontSize?: string;
        fontWeight?: string;
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
      };
      description?: {
        color?: string;
        fontSize?: string;
        fontWeight?: string;
        mobile?: {
          fontSize?: string;
          fontWeight?: string;  
          lineHeight?: string;
       }
      };
      viewMore?: {
        color?: string;
        fontSize?: string;
        fontWeight?: string;
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
      };
      backgroundColor: string;
      backgroundVisibility: 0 | 1;
      hoverColor: string;
      padding: string;
      borderRadius: string;
      shadow: boolean;
      shadowType: string;
    };
  };
  advanceSettings?: {
    sectionAriaLabel?: string;
    sectionRole?: string;
    sectionId?: string;
    tabIndex?: number;
    dataAttributes?: { [key: string]: string };
  };
}


export const iconsSectionFields: Fields<IconsSectionProps> = {
  basicContent: {
    type: "object",
    label: "Basic Content",
    objectFields: {
      title: { type: "text", label: "Section Title" },
      subtitle: { type: "text", label: "Section Subtitle" },
      enableModal: { 
        type: "radio", 
        label: "Enable Modal on Card Click", 
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
      showViewMore: { 
        type: "radio", 
        label: "Show View More Button", 
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
      viewMoreText: { 
        type: "text", 
        label: "View More Button Text", 
        placeholder: "e.g., View more, Learn more, Read more"
      },
      iconCards: {
        type: "array",
        label: "Icon Cards",
        arrayFields: {
          id: { type: "text", label: "Card ID" },
          title: { type: "text", label: "Card Title" },
          description: { type: "textarea", label: "Card Description" },
          longDescription: { type: "textarea", label: "Long Description (for Modal)", placeholder: "Enter detailed description that will show in the modal when clicked" },
          iconType: {
            type: "select", label: "Icon Type",
            options: [
              { label: "External URL", value: "url" },
              { label: "Local File Path", value: "local" },
              { label: "SVG Code", value: "svg" }
            ]
          },
          iconUrl: { type: "textarea", label: "Icon URL or Local Path", placeholder: "Enter URL (https://...) or local path (/images/icon.svg)" },
          iconSvg: { type: "textarea", label: "SVG Code", placeholder: "Enter complete SVG code here (e.g., <svg>...</svg>)" },
          iconSize: { type: "number", label: "Icon Size (px)", min: 16, max: 120, step: 1 },
          iconColor: { type: "text", label: "Icon Color (for SVG icons)", placeholder: "Enter color (e.g., #FF0000, red, rgba(255,0,0,1))" }
        },
        defaultItemProps: {
          id: `icon-${Date.now()}`,
          title: "New Service",
          description: "Add your service description here",
          longDescription: "Add your service long description here",
          iconUrl: "/images/placeholder-icon.svg",
          iconSvg: `<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2L2 7L12 12L22 7L12 2Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2 17L12 22L22 17\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2 12L12 17L22 12\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>`,
          iconType: "svg" as const,
          iconSize: 48,
          iconColor: "#F59E0B"
        }
      }
    }
  },
  styling: {
    type: "object",
    label: "Styling",
    objectFields: {
      layout: {
        type: "object",
        label: "Layout",
        objectFields: {
          backgroundColor: { type: "text", label: "Background Color", placeholder: "e.g., #FFFFFF" },
          maxWidth: { type: "text", label: "Max Width", placeholder: "e.g., 1200px, 100%, auto" }
        }
      },
      spacing: {
        type: "object",
        label: "Spacing",
        objectFields: {
          spacing: {
            type: "object",
            label: "Spacing Settings",
            objectFields: {
              desktop: {
                type: "object",
                label: "Desktop Spacing",
                objectFields: {
                  padding: { type: "text", label: "Padding", placeholder: "e.g., 48px" },
                  margin: { type: "text", label: "Margin", placeholder: "e.g., 0 auto" }
                }
              },
              mobile: {
                type: "object",
                label: "Mobile Spacing",
                objectFields: {
                  padding: { type: "text", label: "Padding", placeholder: "e.g., 24px 16px" },
                  margin: { type: "text", label: "Margin", placeholder: "e.g., 0 auto" }
                }
              }
            }
          }
        }
      },
      typography: {
        type: "object",
        label: "Typography",
        objectFields: {
          title: {
            type: "object",
            label: "Title Typography",
            objectFields: {
              fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 20px" },
              fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
              lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.2" },
              color: { type: "text", label: "Color", placeholder: "e.g., #333333" },
              alignment: {
                type: "radio",
                label: "Alignment",
                options: alignmentOptions
              },
              mobile: {
                type: "object",
                label: "Mobile Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 16px" },
                  fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
                  lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.2" }
                }
              }
            }
          },
          subtitle: {
            type: "object",
            label: "Subtitle Typography",
            objectFields: {
              fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 16px" },
              fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
              lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.5" },
              color: { type: "text", label: "Color", placeholder: "e.g., #333333" },
              alignment: {
                type: "radio",
                label: "Alignment",
                options: alignmentOptions
              },
              mobile: {
                type: "object",
                label: "Mobile Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 14px" },
                  fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
                  lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.5" }
                }
              }
            }
          }
        }
      },
      grid: {
        type: "object",
        label: "Grid Settings",
        objectFields: {
          columns: { type: "number", label: "Desktop Columns", placeholder: "e.g., 4" },
          spacing: { type: "number", label: "Spacing Between Cards (px)", placeholder: "e.g., 32" },
          mobileColumns: { type: "number", label: "Mobile Columns", placeholder: "e.g., 2" },
          mobileSpacing: { type: "number", label: "Mobile Spacing (px)", placeholder: "e.g., 20" }
        }
      },
      card: {
        type: "object",
        label: "Card Styling",
        objectFields: {
          title: {
            type: "object",
            label: "Card Title Styling",
            objectFields: {
              color: { type: "text", label: "Color", placeholder: "e.g., #333333" },
              fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 16px" },
              fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
              mobile: {
                type: "object",
                label: "Mobile Styling",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 14px" },
                  fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
                  lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.2" }
                }
              }
            }
          },
          description: {
            type: "object",
            label: "Card Description Styling",
            objectFields: {
              color: { type: "text", label: "Color", placeholder: "e.g., #666666" },
              fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 14px" },
              fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
              mobile: {
                type: "object",
                label: "Mobile Styling",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 12px" },
                  fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
                  lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.5" }
                }
              }
            }
          },
          viewMore: {
            type: "object",
            label: "View More Button Styling",
            objectFields: {
              color: { type: "text", label: "Color", placeholder: "e.g., #3B82F6" },
              fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 14px" },
              fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
              mobile: {
                type: "object",
                label: "Mobile Styling",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size", placeholder: "e.g., 12px" },
                  fontWeight: { type: "select", label: "Font Weight", options: fontWeightOptions },
                  lineHeight: { type: "text", label: "Line Height", placeholder: "e.g., 1.4" }
                }
              }
            }
          },
          backgroundColor: { type: "text", label: "Background Color", placeholder: "e.g., #FFFFFF" },
          backgroundVisibility: { 
            type: "radio", 
            label: "Background Visibility", 
            options: [
              { label: "Always Visible", value: 0 },
              { label: "Visible on Hover", value: 1 }
            ]
          },
          hoverColor: { type: "text", label: "Hover Color", placeholder: "e.g., #F9FAFB" },
          padding: { type: "text", label: "Padding", placeholder: "e.g., 16px" },
          borderRadius: { type: "text", label: "Border Radius", placeholder: "e.g., 8px" },
          shadow: { type: "radio", label: "Enable Shadow", options: [ { label: "No", value: false }, { label: "Yes", value: true } ] },
          shadowType: { type: "text", label: "Shadow Type", placeholder: "e.g., medium" }
        }
      }
    }
  },
  advanceSettings: {
    type: "object",
    label: "Advanced Settings",
    objectFields: {
      sectionAriaLabel: { type: "text", label: "Section ARIA Label", placeholder: "e.g., Our Services" },
      sectionRole: { type: "text", label: "Section Role", placeholder: "e.g., region" },
      sectionId: { type: "text", label: "Section ID", placeholder: "e.g., services-section" },
      tabIndex: { type: "number", label: "Tab Index", min: -1, max: 100, step: 1 },
      dataAttributes: {
        type: "array",
        label: "Custom Data Attributes",
        arrayFields: {
          key: { type: "text", label: "Attribute Name", placeholder: "e.g., analytics-id" },
          value: { type: "text", label: "Attribute Value", placeholder: "e.g., 12345" }
        }
      }
    }
  }
};

export const iconsSectionDefaultProps: IconsSectionProps = {
  basicContent: {
    title: "Our Services",
    subtitle: "We offer multiple ways to enjoy our cuisine",
    enableModal: true,
    showViewMore: false,
    viewMoreText: "View more",
    iconCards: [
      {
        id: "1",
        title: "Dine In",
        description: "Enjoy our cozy atmosphere",
        longDescription: "Immerse yourself in our restaurant's inviting atmosphere where every meal becomes a memorable experience. Enjoy freshly prepared dishes served by our attentive staff in a comfortable setting perfect for romantic dinners, family gatherings, or business meetings. Our cozy ambiance features carefully curated décor, ambient lighting, and a welcoming environment that makes every visit special.",
        iconUrl: DINE_IN_ICON,
        iconSvg: "",
        iconType: "local",
        iconSize: 56,
        iconColor: "#F59E0B"
      },
      {
        id: "2",
        title: "Takeaway",
        description: "Quick collection service",
        longDescription: "Skip the wait and grab your favorite dishes to go with our efficient takeaway service. Perfect for busy professionals, families on the move, or anyone who wants to enjoy our signature cuisine in the comfort of their own space. Pre-order online or by phone for quick pickup, with all meals carefully packaged to maintain freshness and flavor during transport.",
        iconUrl: TAKEAWAY_ICON,
        iconSvg: "",
        iconType: "local",
        iconSize: 56,
        iconColor: "#F59E0B"
      },
      {
        id: "3",
        title: "Delivery",
        description: "Fresh food to your door",
        longDescription: "Bring the restaurant experience directly to your home with our reliable delivery service. Our professional delivery team ensures your hot, fresh meals arrive promptly while maintaining the quality and presentation you expect. Available within our delivery radius with real-time tracking, contactless delivery options, and eco-friendly packaging that keeps your food at the perfect temperature.",
        iconUrl: DELIVERY_ICON_NEW,
        iconSvg: "",
        iconType: "local",
        iconSize: 56,
        iconColor: "#F59E0B"
      },
      {
        id: "4",
        title: "Catering",
        description: "Special events & parties",
        longDescription: "Transform your special occasions with our comprehensive catering services tailored to events of all sizes. From intimate birthday parties to large corporate functions, weddings, and holiday celebrations, we provide customized menus, professional setup, and experienced staff to ensure your event is flawless. Our catering packages include appetizers, main courses, desserts, and beverage options with flexible pricing and dietary accommodation options.",
        iconUrl: CATERING_ICON,
        iconSvg: "",
        iconType: "local",
        iconSize: 56,
        iconColor: "#F59E0B"
      }
    ]
  },
  styling: {
    layout: {
      backgroundColor: "transparent",
      maxWidth: "unset"
    },
    spacing: {
      spacing: {
        desktop: {
          padding: "40px 30px",
          margin: "0 auto"
        },
        mobile: {
          padding: "24px 16px 8px",
          margin: "0 auto"
        }
      }
    },
    typography: {
      title: {
        fontSize: "32px",
        fontWeight: "600",
        lineHeight: "1.2",
        alignment: "center",
        color: "var(--primary-text)",
        mobile: {
          fontSize: "28px",
          fontWeight: "600",
          lineHeight: "1.2"
        }
      },
      subtitle: {
        fontSize: "16px",
        fontWeight: "500",
        lineHeight: "1.5",
        alignment: "center",
        color: "var(--secondary-text)",
        mobile: {
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1.5"
        }
      }
    },
    grid: {
      columns: 3,
      spacing: 32,
      mobileColumns: 2,
      mobileSpacing: 20
    },
    card: {
      title: {
        color: "var(--primary-text)",
        fontSize: "16px",
        fontWeight: "600",
        mobile: {
          fontSize: "14px",
          fontWeight: "600",
          lineHeight: "1.2"
        }
      },
      description: {
        color: "var(--secondary-text)",
        fontSize: "14px",
        fontWeight: "500",
        mobile: {
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1.5"
        }
      },
      viewMore: {
        color: "var(--accent-color)",
        fontSize: "14px",
        fontWeight: "400",
        mobile: {
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "1.4"
        }
      },
      backgroundColor: "transparent",
      padding: "16px",
      borderRadius: "8px",
      shadow: false,
      shadowType: "medium",
      hoverColor: "var(--cards-containers)",
      backgroundVisibility: 1
    }
  },
  advanceSettings: {
    sectionAriaLabel: "Our Services",
    sectionRole: "region",
    sectionId: "services-section",
    tabIndex: 0,
    dataAttributes: { }
  }
}; 