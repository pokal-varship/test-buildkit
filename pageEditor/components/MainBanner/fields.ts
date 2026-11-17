import type { Fields } from "@measured/puck";
import { descriptionStyling, descriptionTypographyFields } from "pageEditor/commonFields/field";
import React from "react";
import ImageUploadField from "./ImageUploadField";

export interface MainBannerProps {
  basicContent?: {
    title?: string;
    description?: string;
    button?: {
      text?: string;
      actionType?: "url" | "openMenu";
      link?: string;
    };
    image?: {
      url?: string;  
      // mobileUrl?: string;
    };
  };
  styling?: {
    layout?: {
      contentAlignment?: "left" | "center" | "right";
      minHeight?: number;
      mobileHeight?: number;
      maxWidth?: string;
    };
    spacing?: {
      paddingWeb?: string;
      paddingMobile?: string;
    };
    image?: {
      backgroundPosition?: string;
      overlayOpacity?: number;
      overlayColor?: string;
      borderRadius?: string;
      maxWidth?: string;
      objectFit?: string;
      mobile?: {
        backgroundPosition?: string;
        borderRadius?: string;
        maxWidth?: string;
        objectFit?: string;
      };
   
    };
    typography?: {
      textColor?: string;
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      mobile?: {
        fontWeight?: string;
        fontSize?: string;
        lineHeight?: string;
      };
      description?: descriptionStyling
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
  };
  advanceSettings?: {
    imageSettings?: {
      lazyLoad?: boolean;
      altText?: string;
      title?: string;
      ariaLabel?: string; 
      aspectRatio?: {
        mobile?: string;
        desktop?: string;
        customAspectRatio?: {
           desktop?: string;
           mobile?: string;
        }
      };
    };
    accessibility?: {
      ariaLabel?: string;
      role?: string;
    };
    buttonSettings?: {
      showButton?: boolean;
      target?: string;
      rel?: string;
    };
  };
}

export const mainBannerFields: Fields<MainBannerProps> = {
  basicContent: {
    type: "object",
    label: "Basic Content",
    objectFields: {
      title: {
        type: "text",
        label: "Banner Title",
        placeholder: "Enter banner title"
      },
      description: {
        type: "text",
        label: "Banner Description",
        placeholder: "Enter banner description"
      },
      button: {
        type: "object",
        label: "Button",
        objectFields: {
          text: {
            type: "text",
            label: "Button Text",
            placeholder: "Enter button text"
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
            placeholder: "Enter button link (URL)"
          }
        }
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
          // mobileUrl: {
          //   type: "text",
          //   label: "Mobile Image URL",
          //   placeholder: "Enter mobile image URL"
          // }
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
          contentAlignment: {
            type: "select",
            label: "Content Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" }
            ]
          },
          minHeight: {
            type: "number",
            label: "Min Height (px)",
            min: 0,
            step: 1
          },
          mobileHeight: {
            type: "number",
            label: "Mobile Height (px)",
            min: 0,
            step: 1
          },
          maxWidth: {
            type: "text",
            label: "Max Width",
            placeholder: "e.g., 1200px, 100%, auto"
          }
        }
      },
      spacing: {
        type: "object",
        label: "Spacing",
        objectFields: {
          paddingWeb: {
            type: "text",
            label: "Web Padding",
            placeholder: "e.g., 40px 30px"
          },
          paddingMobile: {
            type: "text",
            label: "Mobile Padding",
            placeholder: "e.g., 24px 16px"
          }
        }
      },
      image: {
        type: "object",
        label: "Image Styling",
        objectFields: {
          backgroundPosition: {
            type: "select",
            label: "Background Position",
            options: [
              { label: "Center", value: "center" },
              { label: "Top", value: "top" },
              { label: "Bottom", value: "bottom" }
            ]
          },
          overlayOpacity: {
            type: "number",
            label: "Overlay Opacity",
            min: 0,
            max: 1,
            step: 0.01
          },
          overlayColor: {
            type: "text",
            label: "Overlay Color",
            placeholder: "e.g., #000000"
          },
          borderRadius: {
            type: "text",
            label: "Border Radius",
            placeholder: "e.g., 8px"
          },
          maxWidth: {
            type: "text",
            label: "Image Max Width",
            placeholder: "e.g., 100%"
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
          mobile: {
            type: "object",
            label: "Mobile Image Styling",
            objectFields: {
              backgroundPosition: {
                type: "select",
                label: "Background Position", 
                options: [
                  { label: "Center", value: "center" },
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" }
                ]
              },
              borderRadius: {
                type: "text", 
                label: "Border Radius",
                placeholder: "e.g., 8px"
              },
              maxWidth: {
                type: "text",
                label: "Image Max Width", 
                placeholder: "e.g., 100%"
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
              }
            } 
          }
        }
      },
      typography: {
        type: "object",
        label: "Typography",
        objectFields: {
          textColor: {
            type: "text",
            label: "Text Color",
            placeholder: "e.g., #ffffff"
          },
          fontSize: {
            type: "text",
            label: "Font Size",
            placeholder: "e.g., 56px"
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
          lineHeight: {
            type: "text",
            label: "Line Height",
            placeholder: "e.g., 1.2"
          },
          mobile: {
            type: "object",
            label: "Mobile Typography",
            objectFields: {
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
              fontSize: {
                type: "text",
                label: "Mobile Font Size",
                placeholder: "e.g., 32px"
              },
              lineHeight: {
                type: "text",
                label: "Mobile Line Height",
                placeholder: "e.g., 1.2"
              }
            }
          },
          description: descriptionTypographyFields,
          
        }
      },
      button: {
        type: "object",
        label: "Button Styling",
        objectFields: {
          backgroundColor: {
            type: "text",
            label: "Background Color",
            placeholder: "e.g., #fbbf24"
          },
          hoverBackgroundColor: {
            type: "text",
            label: "Hover Background Color",
            placeholder: "e.g., #FFE38C"
          },
          textColor: {
            type: "text",
            label: "Text Color",
            placeholder: "e.g., #000000"
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
          fontSize: {
            type: "text",
            label: "Font Size",
            placeholder: "e.g., 14px"
          },
          height: {
            type: "text",
            label: "Height",
            placeholder: "e.g., 48px"
          },
          width: {
            type: "text",
            label: "Width",
            placeholder: "e.g., auto"
          },
          borderRadius: {
            type: "text",
            label: "Border Radius",
            placeholder: "e.g., 8px"
          },
          padding: {
            type: "text",
            label: "Padding",
            placeholder: "e.g., 10px 24px"
          },
          boxShadow: {
            type: "text",
            label: "Box Shadow",
            placeholder: "e.g., 0px 2px 8px rgba(0,0,0,0.1)"
          },
          mobile: {
            type: "object",
            label: "Mobile Button Styling",
            objectFields: {
              backgroundColor: {
                type: "text",
                label: "Background Color",
                placeholder: "e.g., #fbbf24"
              },
              hoverBackgroundColor: {
                type: "text",
                label: "Hover Background Color",
                placeholder: "e.g., #FFE38C"
              },
              textColor: {
                type: "text",
                label: "Text Color",
                placeholder: "e.g., #000000"
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
              fontSize: {
                type: "text",
                label: "Font Size",
                placeholder: "e.g., 14px"
              },
              height: {
                type: "text",
                label: "Height",
                placeholder: "e.g., 48px"
              },
              width: {
                type: "text",
                label: "Width",
                placeholder: "e.g., auto"
              },
              borderRadius: {
                type: "text",
                label: "Border Radius",
                placeholder: "e.g., 8px"
              },
              padding: {
                type: "text",
                label: "Padding",
                placeholder: "e.g., 10px 24px"
              },
              boxShadow: {
                type: "text",
                label: "Box Shadow",
                placeholder: "e.g., 0px 2px 8px rgba(0,0,0,0.1)"
              },
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
      imageSettings: {
        type: "object",
        label: "Image Settings",
        objectFields: {
          aspectRatio: {
            type: "object",
            label: "Aspect Ratio",
            objectFields: {
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
              customAspectRatio: {
                type: "object",
                label: "Custom Aspect Ratio (used only if 'Custom' is selected above)",
                objectFields: {
                  desktop: {
                    type: "text",
                    label: "Desktop Aspect Ratio",
                    placeholder: "e.g., 21:9"
                  },
                  mobile: {
                    type: "text",
                    label: "Mobile Aspect Ratio",
                    placeholder: "e.g., 9:21"
                  }
                }
              }
            }
          },
          lazyLoad: {
            type: "radio",
            label: "Lazy Load Image",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          altText: {
            type: "text",
            label: "Image Alt Text"
          },
          title: {
            type: "text",
            label: "Image Title"
          },
          ariaLabel: {
            type: "text",
            label: "Image Aria Label"
          }
        }
      },
      accessibility: {
        type: "object",
        label: "Accessibility",
        objectFields: {
          ariaLabel: {
            type: "text",
            label: "Section Aria Label"
          },
          role: {
            type: "text",
            label: "Section Role"
          }
        }
      },
      buttonSettings: {
        type: "object",
        label: "Button Settings",
        objectFields: {
          showButton: {
            type: "radio",
            label: "Show Button",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          target: {
            type: "text",
            label: "Button Target",
            placeholder: "e.g., _blank, _self"
          },
          rel: {
            type: "text",
            label: "Button Rel",
            placeholder: "e.g., noopener noreferrer"
          },
        }
      }
    }
  }
}; 

export const mainBannerDefaultProps: MainBannerProps = {
  basicContent: {
    title: "Experience Authentic British Cuisine — Right in the Heart of Iconic London",
    button: {
      text: "Order Online",
      actionType: "url",
      link: "#",
    },
    image: {
      url: "https://res.cloudinary.com/dtg06lpdc/image/upload/c_crop,w_1320,h_592/v1753251340/Main-Banner_drhuil.webp?format=webp",
    },
  },
  styling: {
    layout: {
      contentAlignment: "left",
      minHeight: 592,
      mobileHeight: 390,
      maxWidth: "100%",
    },
    spacing: {
      paddingWeb: "40px 30px",
      paddingMobile: "28px 16px 24px",
    },
    image: {
      backgroundPosition: "center",
      overlayOpacity: 0.1,
      overlayColor: "#000000",
      borderRadius: "20px",
      maxWidth: "100%",
      objectFit: "cover",
      mobile:{
        backgroundPosition: "center",
        borderRadius: "14px",
        maxWidth: "100%",
        objectFit: "cover",
      }
    },
    typography: {
      textColor: "text-white",
      fontSize: "60px", 
      fontWeight: "600",
      lineHeight: "1.2",
      mobile: {
        fontWeight: "600",
        fontSize: "36px",
        lineHeight: "1.2",
      },
      description: {
        fontSize: "16px",
        fontWeight: "400",
        lineHeight: "1.3",
        color: "#ffffff",
        alignment: "left",
        mobile: {
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "1.3",
          color: "#ffffff",
          alignment: "left",
        }
      },

    },
    button: {
      backgroundColor: "var(--button-primary-background)",
      hoverBackgroundColor: "var(--button-primary-hover-background)",
      textColor: "var(--button-primary-text)",
      fontWeight: "600",
      fontSize: "16px",
      height: "48px",
      width: "auto",
      borderRadius: "8px",
      padding: "10px 22px",
      boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
      mobile: { 
        backgroundColor: "var(--button-primary-background)",
        hoverBackgroundColor: "var(--button-primary-hover-background)",
        textColor: "var(--button-primary-text)",
        fontWeight: "600",
        fontSize: "14px",
        height: "44px",
        width: "auto",
        borderRadius: "8px",
        padding: "10px 22px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
       
      },
    },
  },
  advanceSettings: {
    imageSettings: {
      lazyLoad: true,
      altText: "Delicious British food presentation",
      title: "Delicious British food presentation",
      ariaLabel: "Delicious British food presentation",
    },
    accessibility: {
      ariaLabel: "Delicious British food presentation",
      role: "banner",
    },
    buttonSettings: {
      showButton: true,
      target: "_blank",
      rel: "noopener noreferrer",
    
    },
  },
};
