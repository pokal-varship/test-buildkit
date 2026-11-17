import type { Fields } from "@measured/puck";
import { buttonStyling, layoutStyling, spacingStyling, subtitleStyling, titleStyling } from "pageEditor/commonFields/field";
// import { MenuItem } from "./component";




export interface PopularItemsSectionProps {

  basicContent?: {
    title?: string;
    subtitle?: string;
    button?: {
      text?: string;
      actionType?: "url" | "openMenu";
      link?: string;
    };
  }
  styling?: {
      layout?: layoutStyling;
      spacing?: spacingStyling;
      typography?: {
      title?: titleStyling;
      subtitle?: subtitleStyling;
      }
      card:{
        imageHeight: string;
        borderRadius: string;
        padding: string;
        productName:{
          lines: number;
          fontSize: string;
          fontWeight: string;
        }
        rating:{
          gap: string;
          fontSize: string;
          fontWeight: string;
        }
        price:{
          fontSize: string;
          fontWeight: string;
        }
        mobile?: {
          imageHeight: string;
          borderRadius: string;
          padding: string;
          productName:{
            lines: number;
            fontSize: string;
          }
          rating:{
            gap: string;
            fontSize: string;
            fontWeight: string;
          }
          price:{
            fontSize: string;
            fontWeight: string;
          }
        }
      }
      button?: buttonStyling;
  }
  advanceSettings?: {
    slider?: {
      showNavigation?: boolean;
      breakpoints?: {
        web?: {
          slidesPerView?: number;
          spaceBetween?: number;
        }
        mobile?: {
          slidesPerView?: number;
          spaceBetween?: number;
        }
      }
      limit?: number;
    }
    buttonSettings?: {
      target?: string;
      rel?: string;
      showButton?: boolean;
      variant?: 'filled' | 'outlined';
    }
    accessibility?: {
      ariaLabel?: string;
      role?: string;
    }
    searchQuery?: string;
    searchBy?: string;
    filterBy?: string;
    sortBy?: string;
    storeId?: string;
    loading?: boolean;
    error?: string | null;
  }

}

export const popularItemsSectionFields: Fields<PopularItemsSectionProps> = {
  basicContent: {
    type: "object",
    label: "Basic Content",
    objectFields: {
      title: {
        type: "text",
        label: "Title",
        placeholder: "Try our most popular items"
      },
      subtitle: {
        type: "text",
        label: "Subtitle",
        placeholder: "Treat yourself to our most-try dishes that have gained people talking"
      },
      button: {
        type: "object",
        label: "Button",
        objectFields: {
          text: {
            type: "text",
            label: "Button Text",
            placeholder: "View Menu"
          },
          actionType: {
            type: "radio",
            label: "Action Type",
            options: [
              { label: "Go to URL", value: "url" },
              { label: "Open Menu", value: "openMenu" }
            ]
          },
          link: {
            type: "text",
            label: "Button Link",
            placeholder: "/menu"
          }
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
          backgroundColor: {
            type: "text",
            label: "Background Color",
            placeholder: "transparent"
          },
          maxWidth: {
            type: "text",
            label: "Max Width",
            placeholder: "1200px"
          },
          mobile: {
            type: "object",
            label: "Mobile Layout",
            objectFields: {
              maxWidth: {
                type: "text",
                label: "Mobile Max Width",
                placeholder: "100%"
              },
              backgroundColor: {
                type: "text",
                label: "Mobile Background Color",
                placeholder: "transparent"
              }
            }
          }
        }
      },
      spacing: {
        type: "object",
        label: "Spacing",
        objectFields: {
          padding: {
            type: "text",
            label: "Padding",
            placeholder: "50px 20px"
          },
          margin: {
            type: "text",
            label: "Margin",
            placeholder: "0"
          },
          mobile: {
            type: "object",
            label: "Mobile Spacing",
            objectFields: {
              padding: {
                type: "text",
                label: "Mobile Padding",
                placeholder: "24px 16px"
              },
              margin: {
                type: "text",
                label: "Mobile Margin",
                placeholder: "0"
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
            label: "Title Styling",
            objectFields: {
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "36px"
              },
              fontWeight: {
                type: "select",
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
              color: {
                type: "text",
                label: "Color",
                placeholder: "var(--primary-text)"
              },
              lineHeight: {
                type: "text",
                label: "Line Height",
                placeholder: "1.2"
              },
              alignment: {
                type: "radio",
                label: "Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" }
                ]
              },
              mobile: {
                type: "object",
                label: "Mobile Title",
                objectFields: {
                  fontSize: {
                    type: "text",
                    label: "Mobile Font Size",
                    placeholder: "32px"
                  },
                  fontWeight: {
                    type: "select",
                    label: "Mobile Font Weight",
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
                  color: {
                    type: "text",
                    label: "Mobile Color",
                    placeholder: "var(--primary-text)"
                  },
                  lineHeight: {
                    type: "text",
                    label: "Mobile Line Height",
                    placeholder: "1.2"
                  },
                  alignment: {
                    type: "radio",
                    label: "Mobile Alignment",
                    options: [
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" }
                    ]
                  }
                }
              }
            }
          },
          subtitle: {
            type: "object",
            label: "Subtitle Styling",
            objectFields: {
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "20px"
              },
              fontWeight: {
                type: "select",
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
              color: {
                type: "text",
                label: "Color",
                placeholder: "var(--secondary-text)"
              },
              lineHeight: {
                type: "text",
                label: "Line Height",
                placeholder: "1.4"
              },
              alignment: {
                type: "radio",
                label: "Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" }
                ]
              },
              mobile: {
                type: "object",
                label: "Mobile Subtitle",
                objectFields: {
                  fontSize: {
                    type: "text",
                    label: "Mobile Font Size",
                    placeholder: "14px"
                  },
                  fontWeight: {
                    type: "select",
                    label: "Mobile Font Weight",
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
                  color: {
                    type: "text",
                    label: "Mobile Color",
                    placeholder: "var(--secondary-text)"
                  },
                  lineHeight: {
                    type: "text",
                    label: "Mobile Line Height",
                    placeholder: "1.4"
                  },
                  alignment: {
                    type: "radio",
                    label: "Mobile Alignment",
                    options: [
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      card: {
        type: "object",
        label: "Card Styling",
        objectFields: {
          imageHeight: {
            type: "text",
            label: "Image Height",
            placeholder: "320px"
          },
          borderRadius: {
            type: "text",
            label: "Border Radius",
            placeholder: "12px"
          },
          padding: {
            type: "text",
            label: "Content Padding",
            placeholder: "16px"
          },
          productName: {
            type: "object",
            label: "Product Name",
            objectFields: {
              lines: {
                type: "number",
                label: "Max Lines",
                min: 1,
                max: 5,
                placeholder: "2"
              },
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "16px"
              },
              fontWeight: {
                type: "select",
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
              }
            }
          },
          rating: {
            type: "object",
            label: "Rating",
            objectFields: {
              gap: {
                type: "text",
                label: "Gap",
                placeholder: "4px"
              },
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "15px"
              },
              fontWeight: {
                type: "select",
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
              }
            }
          },
          price: {
            type: "object",
            label: "Price",
            objectFields: {
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "15px"
              },
              fontWeight: {
                type: "select",
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
              }
            }
          },
          mobile: {
            type: "object",
            label: "Mobile Card",
            objectFields: {
              imageHeight: {
                type: "text",
                label: "Mobile Image Height",
                placeholder: "200px"
              },
              borderRadius: {
                type: "text",
                label: "Mobile Border Radius",
                placeholder: "8px"
              },
              padding: {
                type: "text",
                label: "Mobile Content Padding",
                placeholder: "12px"
              },
              productName: {
                type: "object",
                label: "Mobile Product Name",
                objectFields: {
                  lines: {
                    type: "number",
                    label: "Mobile Max Lines",
                    min: 1,
                    max: 5,
                    placeholder: "2"
                  },
                  fontSize: {
                    type: "text",
                    label: "Mobile Font Size",
                    placeholder: "14px"
                  }
                }
              },
              rating: {
                type: "object",
                label: "Mobile Rating",
                objectFields: {
                  gap: {
                    type: "text",
                    label: "Mobile Gap",
                    placeholder: "2px"
                  },
                  fontSize: {
                    type: "text",
                    label: "Mobile Font Size",
                    placeholder: "12px"
                  },
                  fontWeight: {
                    type: "select",
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                      { label: "Black (900)", value: "900" }
                    ]
                  }
                }
              },
              price: {
                type: "object",
                label: "Mobile Price",
                objectFields: {
                  fontSize: {
                    type: "text",
                    label: "Mobile Font Size",
                    placeholder: "14px"
                  },
                  fontWeight: {
                    type: "select",
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                      { label: "Black (900)", value: "900" }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      button: {
        type: "object",
        label: "Button Styling",
        objectFields: {
          height: {
            type: "text",
            label: "Height",
            placeholder: "auto"
          },
          width: {
            type: "text",
            label: "Width",
            placeholder: "auto"
          },
          backgroundColor: {
            type: "text",
            label: "Background Color",
            placeholder: "var(--button-primary-background)"
          },
          hoverBackgroundColor: {
            type: "text",
            label: "Hover Background Color",
            placeholder: "#FBC02D"
          },
          textColor: {
            type: "text",
            label: "Text Color",
            placeholder: "var(--button-primary-text)"
          },
          borderRadius: {
            type: "text",
            label: "Border Radius",
            placeholder: "8px"
          },
          fontSize: {
            type: "text",
            label: "Font Size",
            placeholder: "16px"
          },
          fontWeight: {
            type: "select",
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
          padding: {
            type: "text",
            label: "Padding",
            placeholder: "12px 24px"
          },
          borderColor: {
            type: "text",
            label: "Border Color",
            placeholder: "transparent"
          },
          mobile: {
            type: "object",
            label: "Mobile Button",
            objectFields: {
              height: {
                type: "text",
                label: "Mobile Height",
                placeholder: "auto"
              },
              width: {
                type: "text",
                label: "Mobile Width",
                placeholder: "auto"
              },
              backgroundColor: {
                type: "text",
                label: "Mobile Background Color",
                placeholder: "var(--button-primary-background)"
              },
              hoverBackgroundColor: {
                type: "text",
                label: "Mobile Hover Background Color",
                placeholder: "#FBC02D"
              },
              textColor: {
                type: "text",
                label: "Mobile Text Color",
                placeholder: "var(--button-primary-text)"
              },
              borderRadius: {
                type: "text",
                label: "Mobile Border Radius",
                placeholder: "6px"
              },
              fontSize: {
                type: "text",
                label: "Mobile Font Size",
                placeholder: "14px"
              },
              fontWeight: {
                type: "select",
                label: "Mobile Font Weight",
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
              padding: {
                type: "text",
                label: "Mobile Padding",
                placeholder: "10px 20px"
              },
              borderColor: {
                type: "text",
                label: "Mobile Border Color",
                placeholder: "transparent"
              }
            }
          }
        }
      }
    }
  },
  advanceSettings: {
    type: "object",
    label: "Advanced Settings",
    objectFields: {
      slider: {
        type: "object",
        label: "Slider Settings",
        objectFields: {
          showNavigation: {
            type: "radio",
            label: "Show Navigation Arrows",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          breakpoints: {
            type: "object",
            label: "Breakpoints",
            objectFields: {
              web: {
                type: "object",
                label: "Web Settings",
                objectFields: {
                  slidesPerView: {
                    type: "number",
                    label: "Slides Per View",
                    min: 1,
                    max: 10,
                    step: 0.5,
                    placeholder: "5.25"
                  },
                  spaceBetween: {
                    type: "number",
                    label: "Space Between (px)",
                    min: 0,
                    max: 100,
                    placeholder: "20"
                  }
                }
              },
              mobile: {
                type: "object",
                label: "Mobile Settings",
                objectFields: {
                  slidesPerView: {
                    type: "number",
                    label: "Slides Per View",
                    min: 1,
                    max: 5,
                    step: 0.5,
                    placeholder: "1.5"
                  },
                  spaceBetween: {
                    type: "number",
                    label: "Space Between (px)",
                    min: 0,
                    max: 50,
                    placeholder: "15"
                  }
                }
              }
            }
          },
          limit: {
            type: "number",
            label: "Number of Items",
            min: 1,
            max: 30,
            placeholder: "12"
          }
        }
      },
      buttonSettings: {
        type: "object",
        label: "Button Settings",
        objectFields: {
          target: {
            type: "text",
            label: "Target",
            placeholder: "_self"
          },
          rel: {
            type: "text",
            label: "Rel",
            placeholder: "noopener noreferrer"
          },
          showButton: {
            type: "radio",
            label: "Show Button",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          variant: {
            type: "select",
            label: "Button Variant",
            options: [
              { label: "Filled", value: "filled" },
              { label: "Outlined", value: "outlined" }
            ]
          }
        }
      },
      accessibility: {
        type: "object",
        label: "Accessibility",
        objectFields: {
          ariaLabel: {
            type: "text",
            label: "ARIA Label",
            placeholder: "Popular items section"
          },
          role: {
            type: "text",
            label: "Role",
            placeholder: "region"
          }
        }
      },
      searchQuery: {
        type: "text",
        label: "Search Query",
        placeholder: "popular"
      },
      searchBy: {
        type: "text",
        label: "Search By",
        placeholder: "name,description"
      },
      filterBy: {
        type: "text",
        label: "Filter By",
        placeholder: "category:=main_course"
      },
      sortBy: {
        type: "text",
        label: "Sort By",
        placeholder: "popularity:desc"
      },
      storeId: {
        type: "text",
        label: "Store ID",
        placeholder: "store_123"
      },
      loading: {
        type: "radio",
        label: "Loading State",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
      error: {
        type: "text",
        label: "Error Message",
        placeholder: "Error loading popular items"
      }
    }
  }
};