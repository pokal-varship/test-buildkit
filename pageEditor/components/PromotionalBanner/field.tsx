import { actionTypeOptions, buttonStyling, layoutStyling, spacingStyling, subtitleStyling, subtitleTypographyFields, titleStyling, titleTypographyFields } from "pageEditor/commonFields/field";

export interface promotionalBannerSectionProps {
    basicContent?: {
        title?: string;
        subtitle?: string;
        button:{
            actionType?: "url" | "openPopup";
            text?: string;
            link?: string;
        }
    };
    styling?: {
        layout?: layoutStyling;
        spacing?: spacingStyling;
        typography?: {
            title?: titleStyling;
            subtitle?: subtitleStyling;
        };
        button?: buttonStyling;
    };
    advanceSettings?: {
        accessibility?: {
            ariaLabel?: string;
            role?: string;
          },
          buttonSettings?: {
            showButton?: boolean;
            showIcon?: boolean;
            target?: string;
            rel?: string;
          
          },
    }
}

export const promotionalBannerSectionFields = {
    basicContent: {
      type: "object" as const,
      label: "Basic Content",
      objectFields: {
        title: { type: "text" as const, label: "Section Title", placeholder: "e.g., Ready to Experience The Golden Spoon?" },
        subtitle: { type: "text" as const, label: "Section Subtitle", placeholder: "e.g., Order now for an unforgettable taste of British cuisine, delivered fresh to your door." },
        button: { type: "object" as const, label: "Button", objectFields: {
            actionType: { type: "radio" as const, label: "Action Type", options: actionTypeOptions },
            text: { type: "text" as const, label: "Button Text", placeholder: "e.g., Learn More" },
            link: { type: "text" as const, label: "Button Link", placeholder: "e.g., /about-us" },
        }},
      },
    },
    styling: {
      type: "object" as const,
      label: "Styling",
      objectFields: {
        layout: {
          type: "object" as const,
          label: "Layout",
          objectFields: {
            backgroundColor: { type: "text" as const, label: "Background Color", placeholder: "e.g., transparent" },
            maxWidth: { type: "text" as const, label: "Max Width", placeholder: "e.g., 1200px" },
            mobile: {
              type: "object" as const,
              label: "Mobile Layout",
              objectFields: {
                backgroundColor: { type: "text" as const, label: "Background Color", placeholder: "e.g., transparent" },
                maxWidth: { type: "text" as const, label: "Max Width", placeholder: "e.g., 100%" },
              },
            },
          },
        },
        spacing: {
          type: "object" as const,
          label: "Spacing",
          objectFields: {
            padding: { type: "text" as const, label: "Padding", placeholder: "e.g., 30px 0" },
            margin: { type: "text" as const, label: "Margin", placeholder: "e.g., 0 auto" },
            mobile: {
              type: "object" as const,
              label: "Mobile Spacing",
              objectFields: {
                padding: { type: "text" as const, label: "Padding", placeholder: "e.g., 20px" },
                margin: { type: "text" as const, label: "Margin", placeholder: "e.g., 0 auto" },
              },
            },
          },
        },
        typography: {
          type: "object" as const,
          label: "Typography",
          objectFields: {
            title: titleTypographyFields,
            subtitle: subtitleTypographyFields,
          },
        },
        button: {
            type: "object" as const,
            label: "Button Styling",
            objectFields: {
              backgroundColor: {
                type: "text" as const,
                label: "Background Color",
                placeholder: "e.g., #fbbf24"
              },
              textColor: {
                type: "text" as const,
                label: "Text Color",
                placeholder: "e.g., #000000"
              },
              fontWeight: {
                type: "select" as const,
                label: "Font Weight",
                options: [
                  { label: "Light (300)", value: "300" },
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                  { label: "Bold (700)", value: "700" },
                  { label: "Extra Bold (800)", value: "800" },
                  { label: "Black (900)", value: "900" }
                ]
              },
              fontSize: {
                type: "text" as const,
                label: "Font Size",
                placeholder: "e.g., 14px"
              },
              height: {
                type: "text" as const,
                label: "Height",
                placeholder: "e.g., 48px"
              },
              width: {
                type: "text" as const,
                label: "Width",
                placeholder: "e.g., auto"
              },
              borderRadius: {
                type: "text" as const,
                label: "Border Radius",
                placeholder: "e.g., 8px"
              },
              padding: {
                type: "text" as const,
                label: "Padding",
                placeholder: "e.g., 10px 24px"
              },
           
              mobile: {
                type: "object" as const,
                label: "Mobile Button Styling",
                objectFields: {
                  backgroundColor: {
                    type: "text" as const,
                    label: "Background Color",
                    placeholder: "e.g., #fbbf24"
                  },
                  textColor: {
                    type: "text" as const,
                    label: "Text Color",
                    placeholder: "e.g., #000000"
                  },
                  fontWeight: {
                    type: "select" as const,
                    label: "Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                      { label: "Black (900)", value: "900" }
                    ]
                  },
                  fontSize: {
                    type: "text" as const,
                    label: "Font Size",
                    placeholder: "e.g., 14px"
                  },
                  height: {
                    type: "text" as const,
                    label: "Height",
                    placeholder: "e.g., 48px"
                  },
                  width: {
                    type: "text" as const,
                    label: "Width",
                    placeholder: "e.g., auto"
                  },
                  borderRadius: {
                    type: "text" as const,
                    label: "Border Radius",
                    placeholder: "e.g., 8px"
                  },
                  padding: {
                    type: "text" as const,
                    label: "Padding",
                    placeholder: "e.g., 10px 24px"
                  },
               
                }
              }
            }
          }
      },
    },
    advanceSettings: {
        type: "object" as const,
        label: "Advance Settings",
        objectFields: {
            accessibility: {
                type: "object" as const,
                label: "Accessibility",
                objectFields: {
                    ariaLabel: { type: "text" as const, label: "Aria Label", placeholder: "e.g., Promotional Banner" },
                    role: { type: "text" as const, label: "Role", placeholder: "e.g., banner" },
                },
            },
            buttonSettings: {
                type: "object" as const,
                label: "Button Settings",
                objectFields: {
                    showButton: { type: "radio" as const, label: "Show Button", options: [
                        { label: "Yes", value: true },
                        { label: "No", value: false }
                    ]}, 
                    showIcon: { type: "radio" as const, label: "Show Icon", options: [
                        { label: "Yes", value: true },
                        { label: "No", value: false }
                    ]},
                    target: { type: "text" as const, label: "Target", placeholder: "e.g., _blank" },
                    rel: { type: "text" as const, label: "Rel", placeholder: "e.g., noopener noreferrer" },
                },
            },
        },
    },
  };


     export const promotionalBannerSectionDefaultProps: promotionalBannerSectionProps = {
     basicContent: {
         title: "Ready to Experience The Golden Spoon?",
         subtitle: "Order now for an unforgettable taste of British cuisine, delivered fresh to your door.",
         button: {
             actionType: "url",
             text: "Order Online Now",
             link: "/menu"
         }
     },
     styling: {
         layout: {
             backgroundColor: "var(--button-primary-background)",
             maxWidth: "100%",
             mobile: {
                 backgroundColor: "var(--button-primary-background)",
                 maxWidth: "100%",
             },
         },
         spacing: {
             padding: "30px 30px",
             margin: "0",
             mobile: {
                 padding: "24px 16px",
                 margin: "0",
             },
         },
        typography: {
            title: {
              fontSize: "40px",
              fontWeight: "600",
              color: "#000000",
              lineHeight: "1.2",
              alignment: "center",
              mobile: {
                fontSize: "32px",
                fontWeight: "600",
                color: "#000000",
                lineHeight: "1.2",
                alignment: "center"
              }
            },
            subtitle: {
              fontSize: "18px",
              fontWeight: "500",
              color: "#000000",
              lineHeight: "1.3",
              alignment: "center",
              mobile: {
                fontSize: "16px",
                fontWeight: "500",
                color: "#000000",
                lineHeight: "1.3",
                alignment: "center"
              }
            }
          },
        button: {
            backgroundColor: "#000000",
            textColor: "#ffffff",
            fontWeight: "600",
            fontSize: "16px",
            height: "48px",
            width: "auto",
            borderRadius: "8px",
            padding: "10px 22px",
            mobile: {
                backgroundColor: "#000000",
                textColor: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                height: "44px",
                width: "auto",
                borderRadius: "8px",
                padding: "10px 22px",
            }
        },
    },
    advanceSettings: {
        accessibility: {
            ariaLabel: "Promotional Banner",
            role: "banner",
        },
        buttonSettings: {
            showButton: true,
            showIcon: false,
            target: "_blank",
            rel: "noopener noreferrer",
        },
    },
  }