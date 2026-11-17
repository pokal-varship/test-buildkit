import React from "react";
import type { Fields } from "@measured/puck";
import ImageUploadField from "../MainBanner/ImageUploadField";

export interface MediaContentProps {
  basic?: {
    title?: string;
    description?: string;
    image?: {
      url?: string;
      actionType?: "navigation" | "non-navigation";
      link?: string;
    };
    button?: {
      text?: string;
      actionType?: "url" | "openMenu";
      link?: string;
    };
  };
  styling?: {
    layout?: {
      maxWidth?: string;
      backgroundColor?: string;
    };
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
    typography?: {
       title?: {
        fontSize?: string;
        fontWeight?: string;
        lineHeight?: string;
        alignment?: "left" | "center" | "right";
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
      };
      description?: {
        fontSize?: string;
        fontWeight?: string;
        lineHeight?: string;
        alignment?: "left" | "center" | "right";
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
       }
     };
    },
    image?: {
      position?: "left" | "right";
      objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
      borderRadius?: string;
      maxWidth?: string;
      height?: string;
      width?: string;
      mobile?: {
        borderRadius?: string;
        maxWidth?: string;
        objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
        position?: "first" | "second";
        height?: string;
        width?: string;
      };
    };
    button?: {
      backgroundColor?: string;
      hoverBackgroundColor?: string;
      textColor?: string;
      fontWeight?: string;
      fontSize?: string;
      height?: string;
      width?: string;
      borderRadius?: string;
      padding?: string;
      boxShadow?: string;
      mobile?: {
        backgroundColor?: string;
        hoverBackgroundColor?: string;
        textColor?: string;
        fontWeight?: string;
        fontSize?: string;
        height?: string;
        width?: string;
        borderRadius?: string;
        padding?: string;
        boxShadow?: string;
      };
     };
  },
  advanced?: {
    accessibility?: {
      ariaLabel?: string;
      role?: string;
    };
    imageSettings?: {
      lazyLoad?: boolean;
      altText?: string;
      title?: string;
      ariaLabel?: string;
      aspectRatio?: {
        desktop?: string;
        mobile?: string;
        custom?: {
          desktop?: string;
          mobile?: string;
        };
      };
    };
    buttonSettings?: {
      target?: string;
      rel?: string;
      showButton?: boolean;
    };
  };
}

export const MediaContentFields: Fields<MediaContentProps> = {
  basic: {
    type: "object",
    label: "Basic Settings",
    objectFields: {
      title: {
        type: "text",
        label: "Section Title"
      },
      description: {
        type: "textarea",
        label: "Description"
      },
      image: {
        type: "object",
        label: "Image",
        objectFields: {
          url: {
            type: "custom",
            label: "Image URL",
            render: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
              return React.createElement(ImageUploadField, {
                value,
                onChange,
                placeholder: "Enter image URL or upload from your device",
                fileTypes: ['image/*']
              });
            }
          },
          actionType: {
            type: "radio",
            label: "Image Action Type",
            options: [
              { label: "Navigation", value: "navigation" },
              { label: "Non-Navigation", value: "non-navigation" }
            ]
          },
          link: {
            type: "text",
            label: "Image URL (Image url should start with / or https:// or http://)"
          }
        }
      },
      button: {
        type: "object",
        label: "Button",
        objectFields: {
          text: {
            type: "text",
            label: "Button Text"
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
            label: "Button URL"
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
          maxWidth: {
            type: "text",
            label: "Max Width"
          },
          backgroundColor: {
            type: "text",
            label: "Background Color"
          }
        }
      },
      spacing: {
        type: "object",
        label: "Spacing",
        objectFields: {
          desktop: {
            type: "object",
            label: "Desktop Spacing",
            objectFields: {
              padding: { type: "text", label: "Padding" },
              margin: { type: "text", label: "Margin" }
            }
          },
          mobile: {
            type: "object",
            label: "Mobile Spacing",
            objectFields: {
              padding: { type: "text", label: "Padding" },
              margin: { type: "text", label: "Margin" }
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
              fontSize: { type: "text", label: "Font Size" },
              fontWeight: {
                type: "select",
                label: "Font Weight",
                options: [
                  { label: "Thin (100)", value: "100" },
                  { label: "Extra Light (200)", value: "200" },
                  { label: "Light (300)", value: "300" },
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                  { label: "Bold (700)", value: "700" },
                  { label: "Extra Bold (800)", value: "800" },
                  { label: "Black (900)", value: "900" }
                ]
              },
              lineHeight: { type: "text", label: "Line Height" },
              alignment: {
                type: "select",
                label: "Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" }
                ]
              },
              mobile: {
                type: "object",
                label: "Mobile Title Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
                  fontWeight: {
                    type: "select",
                    label: "Font Weight",
                    options: [
                      { label: "Thin (100)", value: "100" },
                      { label: "Extra Light (200)", value: "200" },
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                      { label: "Black (900)", value: "900" }
                    ]
                  },
                  lineHeight: { type: "text", label: "Line Height" }
                }
              }
            }
          },
          description: {
            type: "object",
            label: "Description Typography",
            objectFields: {
              fontSize: { type: "text", label: "Font Size" },
              fontWeight: {
                type: "select",
                label: "Font Weight",
                options: [
                  { label: "Thin (100)", value: "100" },
                  { label: "Extra Light (200)", value: "200" },
                  { label: "Light (300)", value: "300" },
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                  { label: "Bold (700)", value: "700" },
                  { label: "Extra Bold (800)", value: "800" },
                  { label: "Black (900)", value: "900" }
                ]
              },
              lineHeight: { type: "text", label: "Line Height" },
              alignment: {
                type: "select",
                label: "Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" }
                ]
              },
              mobile: {
                type: "object",
                label: "Mobile Description Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
                  fontWeight: {
                    type: "select",
                    label: "Font Weight",
                    options: [
                      { label: "Thin (100)", value: "100" },
                      { label: "Extra Light (200)", value: "200" },
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                      { label: "Black (900)", value: "900" }
                    ]
                  },
                  lineHeight: { type: "text", label: "Line Height" }
                }
              }
            }
          }
        }
      },
      image: {
        type: "object",
        label: "Image Styling",
        objectFields: {
          position: {
            type: "select",
            label: "Image Position",
            options: [
              { label: "Left", value: "left" },
              { label: "Right", value: "right" }
            ]
          },
          mobilePosition: {
            type: "select",
            label: "Mobile Image Position",
            options: [
              { label: "First (Image above content)", value: "first" },
              { label: "Second (Image below content)", value: "second" }
            ]
          },
          objectFit: {
            type: "select",
            label: "Object Fit",
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
              { label: "None", value: "none" },
              { label: "Scale Down", value: "scale-down" }
            ]
          },
          borderRadius: { type: "text", label: "Border Radius", placeholder: "e.g., 20px" },
          maxWidth: { type: "text", label: "Max Width" },
          height: { type: "text", label: "Height (px)", placeholder: "e.g., 480" },
          width: { type: "text", label: "Width (px)", placeholder: "e.g., 540" },
          mobile: {
            type: "object",
            label: "Mobile Image Styling",
            objectFields: {
              borderRadius: { type: "text", label: "Border Radius" },
              maxWidth: { type: "text", label: "Max Width" },
              objectFit: {
                type: "select",
                label: "Object Fit",
                options: [
                  { label: "Cover", value: "cover" },
                  { label: "Contain", value: "contain" },
                  { label: "Fill", value: "fill" },
                  { label: "None", value: "none" },
                  { label: "Scale Down", value: "scale-down" }
                ]
              },
              height: { type: "text", label: "Height (px)", placeholder: "e.g., 343" },
              width: { type: "text", label: "Width (px)", placeholder: "e.g., 305" }
            }
          }
        }
      },
      button: {
        type: "object",
        label: "Button Styling",
        objectFields: {
          backgroundColor: { type: "text", label: "Background Color" },
          hoverBackgroundColor: { type: "text", label: "Hover Background Color" },
          textColor: { type: "text", label: "Text Color" },
          fontWeight: { type: "text", label: "Font Weight" },
          fontSize: { type: "text", label: "Font Size" },
          height: { type: "text", label: "Height" },
          width: { type: "text", label: "Width" },
          borderRadius: { type: "text", label: "Border Radius" },
          padding: { type: "text", label: "Padding" },
          boxShadow: { type: "text", label: "Box Shadow" },
          mobile: {
            type: "object",
            label: "Mobile Button Styling",
            objectFields: {
              backgroundColor: { type: "text", label: "Background Color" },
              hoverBackgroundColor: { type: "text", label: "Hover Background Color" },
              textColor: { type: "text", label: "Text Color" },
              fontWeight: { type: "text", label: "Font Weight" },
              fontSize: { type: "text", label: "Font Size" },
              height: { type: "text", label: "Height" },
              width: { type: "text", label: "Width" },
              borderRadius: { type: "text", label: "Border Radius" },
              padding: { type: "text", label: "Padding" },
              boxShadow: { type: "text", label: "Box Shadow" }
            }
          }
        }
      }
    }
  },
  advanced: {
    type: "object",
    label: "Advanced Settings",
    objectFields: {
      accessibility: {
        type: "object",
        label: "Accessibility",
        objectFields: {
          ariaLabel: { type: "text", label: "Section Aria Label" },
          role: { type: "text", label: "Section Role" }
        }
      },
      imageSettings: {
        type: "object",
        label: "Image Advanced Settings",
        objectFields: {
          lazyLoad: {
            type: "radio",
            label: "Lazy Load Image",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          altText: { type: "text", label: "Alt Text" },
          title: { type: "text", label: "Image Title" },
          ariaLabel: { type: "text", label: "Image Aria Label" },
          aspectRatio: {
            type: "object",
            label: "Aspect Ratio",
            objectFields: {
              desktop: {
                type: "select",
                label: "Desktop Aspect Ratio",
                options: [
                  { label: "1:1", value: "1:1" },
                  { label: "16:9", value: "16:9" },
                  { label: "4:3", value: "4:3" },
                  { label: "3:4", value: "3:4" },
                  { label: "2:3", value: "2:3" },
                  { label: "3:2", value: "3:2" },
                  { label: "9:16", value: "9:16" },
                  { label: "1:2", value: "1:2" },
                  { label: "2:1", value: "2:1" },
                  { label: "Custom", value: "custom" },
                ]
              },
              mobile: {
                type: "select",
                label: "Mobile Aspect Ratio",
                options: [
                  { label: "1:1", value: "1:1" },
                  { label: "16:9", value: "16:9" },
                  { label: "4:3", value: "4:3" },
                  { label: "3:4", value: "3:4" },
                  { label: "2:3", value: "2:3" },
                  { label: "3:2", value: "3:2" },
                  { label: "9:16", value: "9:16" },
                  { label: "1:2", value: "1:2" },
                  { label: "2:1", value: "2:1" },
                  { label: "Custom", value: "custom" },
                ]
              },
              custom: {
                type: "object",
                label: "Custom Aspect Ratio (used only if 'Custom' is selected above)",
                objectFields: {
                  desktop: {
                    type: "text",
                    label: "Desktop Custom Aspect Ratio",
                    placeholder: "e.g., 21:9 or 540/380"
                  },
                  mobile: {
                    type: "text",
                    label: "Mobile Custom Aspect Ratio",
                    placeholder: "e.g., 9:21 or 540/380"
                  }
                }
              }
            }
          }
        }
      },
      buttonSettings: {
        type: "object",
        label: "Button Advanced Settings",
        objectFields: {
          target: { type: "text", label: "Button Target" },
          rel: { type: "text", label: "Button Rel" },
          showButton: {
            type: "radio",
            label: "Show Button",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          }
        }
      }
    }
  }
};

export const MediaContentDefaultProps: MediaContentProps = {
  basic: {
    title: "British Cuisine... The Way It Should Be!",
    description: "At The Golden Spoon, we honour the rich traditions of British cooking with a modern touch. Our chefs craft each dish using the freshest local ingredients, blending classic flavours with contemporary techniques to create a dining experience that's both familiar and refreshingly new.",
    image: {
      url: "https://res.cloudinary.com/dtg06lpdc/image/upload/c_crop,w_540,h_480/v1753252917/British-Cuisine_fc8jta.png",
      actionType: "non-navigation",
      link: ""
    },
    button: {
      text: "Order Now",
      actionType: "url",
      link: "/order"
    }
  },
  styling: {
    layout: {
      maxWidth: "100%",
      backgroundColor: "transparent"
    },
    spacing: {
      desktop: {
        padding: "40px 30px",
        margin: "0"
      },
      mobile: {
        padding: "24px 16px",
        margin: "0"
      }
    },
    typography: {
      title: {
        fontSize: "48px",
        fontWeight: "600",
        lineHeight: "120%",
        alignment: "left",
        mobile: {
          fontSize: "28px",
          fontWeight: "600",
          lineHeight: "1.2"
        }
      },
      description: {
        fontSize: "16px",
        fontWeight: "400",
        lineHeight: "120%",
        alignment: "left",
        mobile: {
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "1.3"
        }
      }
    },
    image: {
      position: "left",
      objectFit: "cover",
      borderRadius: "20px",
      height: "480",
      width: "540",
      maxWidth: "400px",
      mobile: {
        borderRadius: "14px",
        maxWidth: "100%",
        objectFit: "cover",
        position: "first",
        height: "305",
        width: "343"
      }
    },
    button: {
      backgroundColor: "var(--button-primary-background)",
      hoverBackgroundColor: "var(--button-primary-hover-background)",
      textColor: "var(--button-primary-text)",
      fontWeight: "600",
      fontSize: "16px",
      height: "auto",
      width: "auto",
      borderRadius: "8px",
      padding: "10px 22px",
      boxShadow: "none",
      mobile: {
        backgroundColor: "var(--button-primary-background)",
        hoverBackgroundColor: "var(--button-primary-hover-background)",
        textColor: "var(--button-primary-text)",
        fontWeight: "600",
        fontSize: "14px",
        height: "auto",
        width: "auto",
        borderRadius: "8px",
        padding: "10px 22px",
        boxShadow: "none"
      }
    }
  },
  advanced: {
    accessibility: {
      ariaLabel: "British cuisine dish featuring fish and chips with traditional accompaniments",
      role: "region"
    },
    imageSettings: {
      lazyLoad: true,
      altText: "British cuisine dish featuring fish and chips with traditional accompaniments",
      title: "British Cuisine",
      ariaLabel: "British cuisine dish featuring fish and chips with traditional accompaniments",
      aspectRatio: {
        desktop: "custom",
        mobile: "custom",
        custom: {
          desktop: "440/380",
          mobile: "343/305"
        }
      }
    },
    buttonSettings: {
      target: "_self",
      rel: "noopener noreferrer",
      showButton: true
    }
  }
};

export { MediaContentFields as fields, MediaContentDefaultProps as defaultProps }; 