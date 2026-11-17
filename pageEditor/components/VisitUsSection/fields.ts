export interface OpeningHours {
  day: string;
  hours: string;
}

export interface ContactInfo {
  phone: string;
  address: string;
}

export interface Location {
  id: string;
  name: string;
  mapImage: string;
  contact: ContactInfo;
  openingHours: OpeningHours[];
  notes?: string;
  getDirectionsUrl?: string;
}

export interface titleStyling {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  lineHeight?: string;
  alignment?: string;
  mobile?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    lineHeight?: string;
    alignment?: string;
  };
  
}

export interface subtitleStyling {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  lineHeight?: string;
  alignment?: string;
  mobile?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    lineHeight?: string;
    alignment?: string;
  };
}

export interface tabsContainerStyling {
  gap?: string
  maxWidth?: string
  activeTabColor?: string;
  activeTabBackground?: string;
  inactiveTabColor?: string;
  inactiveTabBackground?: string;
  activeTabBorder?: string;
  mobile?: {
    gap?: string;
    maxWidth?: string;
    activeTabColor?: string;
    activeTabBackground?: string;
    inactiveTabColor?: string;
    inactiveTabBackground?: string;
    activeTabBorder?: string;
  };
}

export interface buttonStyling {
  height?: string;
  width?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  borderColor?: string;
  mobile?: {
    height?: string;
    width?: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    borderColor?: string;
  }
}

export interface ContactIconStyling {
  size?: string;
  color?: string;
}

export interface contactLabelStyling {
   fontSize?: string;
   fontWeight?: string;
   color?: string;
   lineHeight?: string;
   mobile?: {
    fontSize?: string;
    fontWeight?: string;
     color?: string;
     lineHeight?: string;
   }
}

export interface contactTextStyling {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    lineHeight?: string;
    mobile?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      lineHeight?: string;
    }
}

export interface contactSectionStyling {
  icon?: ContactIconStyling;
  label?: contactLabelStyling;
  text?: contactTextStyling;
}

export interface VisitUsSectionProps {
  basicContent?: {
    title?: string;
    subtitle?: string;
    button?: {
      text?: string;
      link?: string;
    };
    notes?: string;
  };
  styling?: {
     layout?: {
      backgroundColor?: string;
      padding?: string;
      margin?: string;
      maxWidth?: string;
       mobile?: {
        backgroundColor?: string;
        padding?: string;
        margin?: string;
        maxWidth?: string;
       }
     }
     typography?: {
       title?: titleStyling;
       subtitle?: subtitleStyling;
     }
     tabsContainer?: tabsContainerStyling;
     contactStyling?: contactSectionStyling;
     button?: buttonStyling;
  };
  advanceSettings?: {
      locations?: Location[];
      buttonSettings?: {
        target?: string;
        rel?: string;
        showButton?: boolean;
        variant?: 'filled' | 'outlined';
      };
      accessibility?: {
        ariaLabel?: string;
        role?: string;
      };
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
  }
  };
 

export const visitUsSectionFields = {
  basicContent: {
    type: "object" as const,
    label: "Basic Content",
    objectFields: {
      title: {
        type: "text" as const,
        label: "Section Title",
        placeholder: "e.g., Visit Us",
      },
      subtitle: {
        type: "text" as const,
        label: "Section Subtitle",
        placeholder: "e.g., Come and experience our warm hospitality",
      },
      button: {
        type: "object" as const,
        label: "Button",
        objectFields: {
          text: {
            type: "text" as const,
            label: "Button Text",
            placeholder: "e.g., Get Directions",
          },
          link: {
            type: "text" as const,
            label: "Button Link",
            placeholder: "e.g., https://maps.google.com",
          },
        },
      },
      notes: {
        type: "text" as const,
        label: "Additional Notes",
        placeholder: "e.g., Kitchen closes 30 minutes before closing time",
      },
    },
  },
  styling: {
    type: "object" as const,
    label: "Styling Options",
    objectFields: {
      layout: {
        type: "object" as const,
        label: "Layout",
        objectFields: {
          backgroundColor: {
            type: "text" as const,
            label: "Background Color",
            placeholder: "e.g., #ffffff, white",
          },
          padding: {
            type: "text" as const,
            label: "Padding",
            placeholder: "e.g., 80px, 5rem, 100px",
          },
          margin: {
            type: "text" as const,
            label: "Margin",  
            placeholder: "e.g., 80px, 5rem, 100px",
          },
          maxWidth: {
            type: "text" as const,
            label: "Max Width",
            placeholder: "e.g., 1200px, 75rem, 100%",
          },
          mobile: {
            type: "object" as const,
            label: "Mobile Styling",
            objectFields: {
              backgroundColor: {
                type: "text" as const,
                label: "Mobile Background Color",
                placeholder: "e.g., #ffffff, white",
              },
              padding: {
                type: "text" as const,
                label: "Mobile Padding",
                placeholder: "e.g., 80px, 5rem, 100px",
              },
              margin: {
                type: "text" as const,
                label: "Mobile Margin",
                placeholder: "e.g., 80px, 5rem, 100px",
              },
              maxWidth: {
                type: "text" as const,
                label: "Mobile Max Width",
                placeholder: "e.g., 1200px, 75rem, 100%",
              },
            },
            },
      },
      },
      typography: {
        type: "object" as const,
        label: "Typography",
        objectFields: {
          title: {
            type: "object" as const,
            label: "Title Styling",
            objectFields: {
              fontSize: {
                type: "text" as const,
                label: "Font Size",
                placeholder: "e.g., 48px, 3rem, 2.5em",
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
                ],
              },
              color: {
                type: "text" as const,
                label: "Text Color",
                placeholder: "e.g., #282828, var(--primary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g., 1.2, 1.4, 20px",
              },
              alignment: {
                type: "select" as const,
                label: "Text Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" },
                ],
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Mobile Font Size",
                    placeholder: "e.g., 32px, 2rem, 1.8em",
                  },
                  fontWeight: {
                    type: "select" as const,
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                      { label: "Extra Bold (800)", value: "800" },
                    ],
                  },
                  color: {
                    type: "text" as const,
                    label: "Mobile Text Color",
                    placeholder: "e.g., #282828, var(--primary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Mobile Line Height",
                    placeholder: "e.g., 1.2, 1.4, 20px",
                  },
                  alignment: {
                    type: "select" as const,
                    label: "Mobile Text Alignment",
                    options: [
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" },
                    ],
                  },
                },
              },
            },
          },
          subtitle: {
            type: "object" as const,
            label: "Subtitle Styling",
            objectFields: {
              fontSize: {
                type: "text" as const,
                label: "Font Size",
                placeholder: "e.g., 18px, 1.125rem, 1.2em",
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
                ],
              },
              color: {
                type: "text" as const,
                label: "Text Color",
                placeholder: "e.g., #666666, var(--secondary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g., 1.5, 1.4, 20px",
              },
              alignment: {
                type: "select" as const,
                label: "Text Alignment",
                options: [
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" },
                ],
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Mobile Font Size",
                    placeholder: "e.g., 16px, 1rem, 1em",
                  },
                  fontWeight: {
                    type: "select" as const,
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                    ],
                  },
                  color: {
                    type: "text" as const,
                    label: "Mobile Text Color",
                    placeholder: "e.g., #666666, var(--secondary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Mobile Line Height",
                    placeholder: "e.g., 1.5, 1.4, 20px",
                  },
                  alignment: {
                    type: "select" as const,
                    label: "Mobile Text Alignment",
                    options: [
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      tabsContainer: {
        type: "object" as const,
        label: "Tabs Container Styling",
        objectFields: {
          gap: {
            type: "text" as const,
            label: "Gap",
            placeholder: "e.g., 20px, 1.25rem, 5",
          },
          maxWidth: {
            type: "text" as const,
            label: "Max Width",
            placeholder: "e.g., 800px, 50rem, 100%",
          },
          activeTabColor: {
            type: "text" as const,
            label: "Active Tab Text Color",
            placeholder: "e.g., #ffffff, white",
          },
          activeTabBackground: {
            type: "text" as const,
            label: "Active Tab Background Color",
            placeholder: "e.g., #282828, var(--primary-dark)",
          },
          inactiveTabColor: {
            type: "text" as const,
            label: "Inactive Tab Text Color",
            placeholder: "e.g., #666666, var(--secondary-text)",
          },
          inactiveTabBackground: {
            type: "text" as const,
            label: "Inactive Tab Background Color",
            placeholder: "e.g., #f0f0f0, #e0e0e0",
          },
          activeTabBorder: {
            type: "text" as const,
            label: "Active Tab Border Color",
            placeholder: "e.g., #282828, var(--primary-color)",
          },
          mobile: {
            type: "object" as const,
            label: "Mobile Styling",
            objectFields: {
              gap: {
                type: "text" as const,
                label: "Mobile Gap",
                placeholder: "e.g., 12px, 0.75rem, 3",
              },
              maxWidth: {
                type: "text" as const,
                label: "Mobile Max Width",
                placeholder: "e.g., 100%, 20rem, 320px",
              },
              activeTabColor: {
                type: "text" as const,
                label: "Mobile Active Tab Text Color",
                placeholder: "e.g., #ffffff, white",
              },
              activeTabBackground: {
                type: "text" as const,
                label: "Mobile Active Tab Background Color",
                placeholder: "e.g., #282828, var(--primary-dark)",
              },
              inactiveTabColor: {
                type: "text" as const,
                label: "Mobile Inactive Tab Text Color",
                placeholder: "e.g., #666666, var(--secondary-text)",
              },
              inactiveTabBackground: {
                type: "text" as const,
                label: "Mobile Inactive Tab Background Color",
                placeholder: "e.g., #f0f0f0, #e0e0e0",
              },
              activeTabBorder: {
                type: "text" as const,
                label: "Mobile Active Tab Border Color",
                placeholder: "e.g., #282828, var(--primary-color)",
              },
            },
          },
        },
      },
      contactStyling: {
        type: "object" as const,
        label: "Contact Section Styling",
        objectFields: {
          icon: {
            type: "object" as const,
            label: "Icon Styling",
            objectFields: {
              size: {
                type: "text" as const,
                label: "Icon Size",
                placeholder: "e.g., 20px, 1.25rem",
              },
              color: {
                type: "text" as const,
                label: "Icon Color",
                placeholder: "e.g., #F2C94C, var(--primary-color)",
              },
            },
          },
          label: {
            type: "object" as const,
            label: "Contact Label Styling",
            objectFields: {
              fontSize: {
                type: "text" as const,
                label: "Font Size",
                placeholder: "e.g., 14px, 0.875rem",
              },
              fontWeight: {
                type: "select" as const,
                label: "Font Weight",
                options: [
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                  { label: "Bold (700)", value: "700" },
                ],
              },
              color: {
                type: "text" as const,
                label: "Text Color",
                placeholder: "e.g., #282828, var(--primary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g., 1.5, 1.4, 20px",
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Mobile Font Size",
                    placeholder: "e.g., 12px, 0.75rem",
                  },
                  fontWeight: {
                    type: "select" as const,
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                      { label: "Bold (700)", value: "700" },
                    ],
                  },
                  color: {
                    type: "text" as const,
                    label: "Mobile Text Color",
                    placeholder: "e.g., #282828, var(--primary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Mobile Line Height",
                    placeholder: "e.g., 1.5, 1.4, 20px",
                  },
                },
              },
            },
          },
          text: {
            type: "object" as const,
            label: "Contact Text Styling",
            objectFields: {
              fontSize: {
                type: "text" as const,
                label: "Font Size",
                placeholder: "e.g., 14px, 0.875rem",
              },
              fontWeight: {
                type: "select" as const,
                label: "Font Weight",
                options: [
                  { label: "Light (300)", value: "300" },
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                ],
              },
              color: {
                type: "text" as const,
                label: "Text Color",
                placeholder: "e.g., #666666, var(--secondary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g., 1.5, 1.4, 20px",
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Mobile Font Size",
                    placeholder: "e.g., 12px, 0.75rem",
                  },
                  fontWeight: {
                    type: "select" as const,
                    label: "Mobile Font Weight",
                    options: [
                      { label: "Light (300)", value: "300" },
                      { label: "Normal (400)", value: "400" },
                      { label: "Medium (500)", value: "500" },
                      { label: "Semi Bold (600)", value: "600" },
                    ],
                  },
                  color: {
                    type: "text" as const,
                    label: "Mobile Text Color",
                    placeholder: "e.g., #666666, var(--secondary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Mobile Line Height",
                    placeholder: "e.g., 1.5, 1.4, 20px",
                  },
                },
              },
            },
          },
        },
      },
      button: {
        type: "object" as const,
        label: "Button Styling",
        objectFields: {
          height: {
            type: "text" as const,
            label: "Height",
            placeholder: "e.g., 40px, 2.5rem",
          },
          width: {
            type: "text" as const,
            label: "Width",
            placeholder: "e.g., 120px, 7.5rem",
          },
          backgroundColor: {
            type: "text" as const,
            label: "Background Color",
            placeholder: "e.g., #F2C94C, var(--primary-color)",
          },
          hoverBackgroundColor: {
            type: "text" as const,
            label: "Hover Background Color",
            placeholder: "e.g., #F2C94C, var(--primary-color)",
          },
          textColor: {
            type: "text" as const,
            label: "Text Color",
            placeholder: "e.g., #ffffff, var(--primary-text)",
          },
          borderRadius: {
            type: "text" as const,
            label: "Border Radius",
            placeholder: "e.g., 8px, 0.5rem",
          },
          fontSize: {
            type: "text" as const,
            label: "Font Size",
            placeholder: "e.g., 14px, 0.875rem",
          },
          fontWeight: {
            type: "select" as const,
            label: "Font Weight",
            options: [
              { label: "Normal (400)", value: "400" },
              { label: "Medium (500)", value: "500" },
              { label: "Semi Bold (600)", value: "600" },
              { label: "Bold (700)", value: "700" },
            ],
          },
          padding: {
            type: "text" as const,
            label: "Padding",
            placeholder: "e.g., 12px 24px, 0.75rem 1.5rem",
          },
          borderColor: {
            type: "text" as const,
            label: "Border Color",
            placeholder: "e.g., #F2C94C, var(--primary-color)",
          },
          mobile: {
            type: "object" as const,
            label: "Mobile Styling",
            objectFields: {
              height: {
                type: "text" as const,
                label: "Mobile Height",
                placeholder: "e.g., 36px, 2.25rem",
              },
              width: {
                type: "text" as const,
                label: "Mobile Width",
                placeholder: "e.g., 100px, 6.25rem",
              },
              backgroundColor: {
                type: "text" as const,
                label: "Mobile Background Color",
                placeholder: "e.g., #F2C94C, var(--primary-color)",
              },
              hoverBackgroundColor: {
                type: "text" as const,
                label: "Mobile Hover Background Color",
                placeholder: "e.g., #F2C94C, var(--primary-color)",
              },
              textColor: {
                type: "text" as const,
                label: "Mobile Text Color",
                placeholder: "e.g., #ffffff, var(--primary-text)",
              },
              borderRadius: {
                type: "text" as const,
                label: "Mobile Border Radius",
                placeholder: "e.g., 6px, 0.375rem",
              },
              fontSize: {
                type: "text" as const,
                label: "Mobile Font Size",
                placeholder: "e.g., 12px, 0.75rem",
              },
              fontWeight: {
                type: "select" as const,
                label: "Mobile Font Weight",
                options: [
                  { label: "Normal (400)", value: "400" },
                  { label: "Medium (500)", value: "500" },
                  { label: "Semi Bold (600)", value: "600" },
                  { label: "Bold (700)", value: "700" },
                ],
              },
              padding: {
                type: "text" as const,
                label: "Mobile Padding",
                placeholder: "e.g., 10px 20px, 0.625rem 1.25rem",
              },
              borderColor: {
                type: "text" as const,
                label: "Mobile Border Color",
                placeholder: "e.g., #F2C94C, var(--primary-color)",
              },
            },
          },
        },
      },
     },
  },
  advanceSettings: {
    type: "object" as const,
    label: "Advanced Settings",
    objectFields: {
      locations: {
        type: "array" as const,
        label: "Locations",
        getItemSummary: (item: Location) => item.name || "New Location",
        defaultItemProps: {
          id: "new-location",
          name: "New Location",
          mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Map+Placeholder",
          contact: {
            phone: "+44 20 7123 4567",
            address: "Your address here"
          },
          openingHours: [
            { day: "Monday", hours: "12:00 PM - 10:00 PM" },
            { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
            { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
            { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
            { day: "Friday", hours: "12:00 PM - 11:00 PM" },
            { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
            { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
          ],
          notes: "Kitchen closes 30 minutes before closing time",
          getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=51.523767,-0.158555"
        },
        arrayFields: {
          id: {
            type: "text" as const,
            label: "Location ID",
            placeholder: "e.g., london, manchester",
          },
          name: {
            type: "text" as const,
            label: "Location Name",
            placeholder: "e.g., London, Manchester",
          },
          mapImage: {
            type: "text" as const,
            label: "Map Image URL",
            placeholder: "Enter Google Maps static image URL or other map image",
          },
          contact: {
            type: "object" as const,
            label: "Contact Information",
            objectFields: {
              phone: {
                type: "text" as const,
                label: "Phone Number",
                placeholder: "e.g., +44 20 7123 4567",
              },
              address: {
                type: "textarea" as const,
                label: "Address",
                placeholder: "Enter full address (use line breaks for multiple lines)",
              },
            },
          },
          openingHours: {
            type: "array" as const,
            label: "Opening Hours",
            getItemSummary: (item: OpeningHours) => `${item.day}: ${item.hours}`,
            defaultItemProps: {
              day: "Monday",
              hours: "12:00 PM - 10:00 PM"
            },
            arrayFields: {
              day: {
                type: "select" as const,
                label: "Day",
                options: [
                  { label: "Monday", value: "Monday" },
                  { label: "Tuesday", value: "Tuesday" },
                  { label: "Wednesday", value: "Wednesday" },
                  { label: "Thursday", value: "Thursday" },
                  { label: "Friday", value: "Friday" },
                  { label: "Saturday", value: "Saturday" },
                  { label: "Sunday", value: "Sunday" },
                ],
              },
              hours: {
                type: "text" as const,
                label: "Hours",
                placeholder: "e.g., 12:00 PM - 10:00 PM, Closed",
              },
            },
          },
          notes: {
            type: "text" as const,
            label: "Additional Notes",
            placeholder: "e.g., Kitchen closes 30 minutes before closing time",
          },
          getDirectionsUrl: {
            type: "text" as const,
            label: "Get Directions URL",
            placeholder: "e.g., https://www.google.com/maps/dir/?api=1&destination=51.523767,-0.158555",
          },
        },
      },
      buttonSettings: {
        type: "object" as const,
        label: "Button Settings",
        objectFields: {
          target: {
            type: "select" as const,
            label: "Target",
            options: [
              { label: "Same Window", value: "_self" },
              { label: "New Window", value: "_blank" },
            ],
          },
          rel: {
            type: "text" as const,
            label: "Rel Attribute",
            placeholder: "e.g., noopener noreferrer",
          },
          showButton: {
            type: "radio" as const,
            label: "Show Button",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          variant: {
            type: "select" as const,
            label: "Button Variant",
            options: [
              { label: "Filled", value: "filled" },
              { label: "Outlined", value: "outlined" },
            ],
          },
        },
      },
      accessibility: {
        type: "object" as const,
        label: "Accessibility",
        objectFields: {
          ariaLabel: {
            type: "text" as const,
            label: "ARIA Label",
            placeholder: "e.g., Visit us section with location information",
          },
          role: {
            type: "text" as const,
            label: "Role",
            placeholder: "e.g., region, main",
          },
        },
      },
      coordinates: {
        type: "object" as const,
        label: "Coordinates for API",
        objectFields: {
          latitude: {
            type: "number" as const,
            label: "Latitude",
            placeholder: "e.g., 51.5074",
          },
          longitude: {
            type: "number" as const,
            label: "Longitude",
            placeholder: "e.g., -0.1278",
          },
        },
      },
    },
  },
};

export const visitUsSectionDefaultProps: VisitUsSectionProps = {
  basicContent: {
    title: "Visit Us",
    subtitle: "Come and experience our warm hospitality",
    button: {
      text: "Get Directions",
      link: "https://maps.google.com"
    },
    notes: "Kitchen closes 30 minutes before closing time"
  },
  styling: {
    layout: {
      backgroundColor: "transparent",
      padding: "40px 30px",
      margin: "0 auto",
      maxWidth: "100%",
      mobile: {
        backgroundColor: "transparent",
        padding: "24px 16px",
        margin: "0 auto",
        maxWidth: "100%",
      }
    },
    typography: {
      title: {
        fontSize: "32px",
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
        lineHeight: "1.3",
        alignment: "center",
        mobile: {
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--secondary-text)",
          lineHeight: "1.3",
          alignment: "center"
        }
      }
    },
    tabsContainer: {
      gap: "20px",
      maxWidth: "100%",
      activeTabColor: "var(--primary-text)",
      activeTabBackground: "var(--button-primary-active-background)",
      inactiveTabColor: "var(--secondary-text)",
      inactiveTabBackground: "transparent",
      activeTabBorder: "var(--primary-color)",
      mobile: {
        gap: "12px",
        maxWidth: "100%",
        activeTabColor: "var(--primary-text)",
        activeTabBackground: "var(--button-primary-active-background)",
        inactiveTabColor: "var(--secondary-text)",
        inactiveTabBackground: "transparent",
        activeTabBorder: "var(--primary-color)"
      }
    },
    contactStyling: {
      icon: {
        size: "20px",
        color: "var(--primary-color)"
      },
      label: {
        fontSize: "16px",
        fontWeight: "600",
        color: "var(--primary-text)",
        lineHeight: "1.3",
        mobile: {
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.3"
        }
      },
      text: {
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--secondary-text)",
        lineHeight: "1.3",
        mobile: {
          fontSize: "12px",
          fontWeight: "600",
          color: "var(--secondary-text)",
          lineHeight: "1.3"
        }
      }
    },
    button: {
      height: "48px",
      width: "auto",
      backgroundColor: "var(--button-primary-background)",
      textColor: "var(--button-primary-text)",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      padding: "10px 22px",
      borderColor: "var(--primary-color)",
      mobile: {
        height: "44px",
        width: "auto",
        backgroundColor: "var(--button-primary-background)",
        textColor: "var(--button-primary-text)",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        padding: "10px 22px",
        borderColor: "var(--primary-color)"
      }
    }
  },
  advanceSettings: {
    locations: [
      {
        id: "london",
        name: "London",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Map+Placeholder",
        contact: {
          phone: "+44 20 7123 4567",
          address: "Unit GS26/27 Lower Mall,\nThe Atrium, Union Square,\nAberdeen AB11 5PS"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=51.523767,-0.158555"
      },
      {
        id: "manchester",
        name: "Manchester",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Manchester+Map",
        contact: {
          phone: "+44 161 123 4567",
          address: "123 Market Street,\nNorthern Quarter,\nManchester M1 1AA"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=53.480759,-2.242631"
      },
      {
        id: "birmingham",
        name: "Birmingham",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Birmingham+Map",
        contact: {
          phone: "+44 121 123 4567",
          address: "456 High Street,\nBirmingham City Centre,\nBirmingham B1 2AA"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=52.47863,-1.893611"
      },
      {
        id: "liverpool",
        name: "Liverpool",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Liverpool+Map",
        contact: {
          phone: "+44 151 123 4567",
          address: "789 Bold Street,\nLiverpool City Centre,\nLiverpool L1 4HY"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=53.400002,-2.993333"
      },
      {
        id: "leeds",
        name: "Leeds",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Leeds+Map",
        contact: {
          phone: "+44 113 123 4567",
          address: "321 Briggate,\nLeeds City Centre,\nLeeds LS1 6AZ"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=53.797418,-1.535328"
      },
      {
        id: "glasgow",
        name: "Glasgow",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Glasgow+Map",
        contact: {
          phone: "+44 141 123 4567",
          address: "654 Sauchiehall Street,\nGlasgow City Centre,\nGlasgow G2 3AH"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=55.861111,-4.250833"
      },
      {
        id: "bristol",
        name: "Bristol",
        mapImage: "https://via.placeholder.com/400x300/e5e5e5/999999?text=Bristol+Map",
        contact: {
          phone: "+44 117 123 4567",
          address: "987 Park Street,\nClifton Village,\nBristol BS1 5PB"
        },
        openingHours: [
          { day: "Monday", hours: "12:00 PM - 10:00 PM" },
          { day: "Tuesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Wednesday", hours: "12:00 PM - 10:00 PM" },
          { day: "Thursday", hours: "12:00 PM - 10:00 PM" },
          { day: "Friday", hours: "12:00 PM - 11:00 PM" },
          { day: "Saturday", hours: "11:00 AM - 11:00 PM" },
          { day: "Sunday", hours: "11:00 AM - 09:00 PM" }
        ],
        notes: "Kitchen closes 30 minutes before closing time",
        getDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=51.455041,-2.605551"
      }
    ],
    buttonSettings: {
      target: "_blank",
      rel: "noopener noreferrer",
      showButton: true,
      variant: "filled" as const
    },
    accessibility: {
      ariaLabel: "Visit us section with location information",
      role: "region"
    },
    coordinates: {
      latitude: 0,
      longitude: 0
    }
  }
};

// Explicit export to ensure module compatibility
export { visitUsSectionFields as fields, visitUsSectionDefaultProps as defaultProps }; 
