import type { Fields } from "@measured/puck";

export interface TestimonialsSectionProps {
  basicContent?: {
    title?: string;
    subtitle?: string;
    testimonials?: Array<{
      id: string;
      name: string;
      // location: string;
      rating: number;
      review: string;
      // avatar: string;
     }>;
     button?: {
      text?: string;
      link?: string;
    };
  },
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
      title:{
        fontSize?: string;
        fontWeight?: string;
        lineHeight?: string;
        color?: string;
        alignment?: "left" | "center" | "right";
        mobile?: {
          fontSize?: string;
          fontWeight?: string;
          lineHeight?: string;
          color?: string;
        };
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
          color?: string;
     };
    
    }
    };
    rating?: {
      fontSize?: string;
      color?: string;
      starColor?: string;
      alignment?: "left" | "center" | "right";
      mobile?: {
        fontSize?: string;
        color?: string;
        starColor?: string;
      };
    };
    card?:{
      backgroundColor?: string;
      borderRadius?: string;
      padding?: string;
      review?: {
        fontSize?: string;
        color?: string;
        fontWeight?: string;
        lineHeight?: string;
        mobile?: {
          fontSize?: string;
          color?: string;
          fontWeight?: string;
          lineHeight?: string;
        };
      };
      location?: {
        fontSize?: string;
        color?: string;
        fontWeight?: string;
        lineHeight?: string;
        mobile?: {
          fontSize?: string;
          color?: string;
          fontWeight?: string;
          lineHeight?: string;
        };
      };
    };
    button?: {
      backgroundColor?: string;
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
  advanceSettings?:{
    ratings:{
      showGoogleRating?: boolean;
      googleRating?: number;
      googleRatingText?: string;
    }
    cardSettings?: {
      boxShadow?: boolean;
      minHeight?: string;
      mobile?: {
        minHeight?: string;
      };
    }
    buttonSettings?: {
      showButton?: boolean;
      target?: string;
      rel?: string;
    };
    accessibility?: {
      ariaLabel?: string;
      role?: string;
      tabIndex?: number;
    };
    // Additional fields for resolveData functionality
    filterModeratedReviews?: boolean;
    maxTestimonials?: number;
    loading?: boolean;
    error?: string | null;
    totalReviews?: number;
  }
}

export const testimonialsSectionFields: Fields<TestimonialsSectionProps> = {
  basicContent: {
    type: "object",
    label: "Basic Content",
    objectFields: {
      title: {
        type: "text",
        label: "Section Title"
      },
      subtitle: {
        type: "text",
        label: "Subtitle"
      },
      testimonials: {
        type: "array",
        label: "Testimonials",
        max: 3,
        arrayFields: {
          id: { type: "text", label: "ID" },
          name: { type: "text", label: "Customer Name" },
          // location: { type: "text", label: "Location" },
          rating: { type: "number", label: "Rating", min: 1, max: 5, step: 1 },
          review: { type: "textarea", label: "Review Text" },
          // avatar: { type: "text", label: "Avatar URL" }
        },
        getItemSummary: (item) => `${item.name}`,
        defaultItemProps: {
          id: "",
          name: "",
          location: "",
          rating: 5,
          review: "",
          avatar: ""
        }
      },
      button: {
        type: "object",
        label: "Button",
        objectFields: {
          text: { type: "text", label: "Button Text" },
          link: { type: "text", label: "Button Link (URL)" }
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
          maxWidth: { type: "text", label: "Max Width (e.g., 1200px, 100%, auto)" },
          backgroundColor: { type: "text", label: "Background Color" }
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
              padding: { type: "text", label: "Desktop Padding" },
              margin: { type: "text", label: "Desktop Margin" }
            }
          },
          mobile: {
            type: "object",
            label: "Mobile Spacing",
            objectFields: {
              padding: { type: "text", label: "Mobile Padding" },
              margin: { type: "text", label: "Mobile Margin" }
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
              color: { type: "text", label: "Color" },
              mobile: {
                type: "object",
                label: "Mobile Title Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
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
                  lineHeight: { type: "text", label: "Line Height" },
                  color: { type: "text", label: "Color" }
                }
              }
            }
          },
          subtitle: {
            type: "object",
            label: "Subtitle Typography",
            objectFields: {
              fontSize: { type: "text", label: "Font Size" },
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
              lineHeight: { type: "text", label: "Line Height" },
              color: { type: "text", label: "Color" },
              mobile: {
                type: "object",
                label: "Mobile Subtitle Typography",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
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
                  lineHeight: { type: "text", label: "Line Height" },
                  color: { type: "text", label: "Color" }
                }
              }
            }
          }
        }
      },
      rating: {
        type: "object",
        label: "Rating Styling",
        objectFields: {
          fontSize: { type: "text", label: "Font Size" },
          color: { type: "text", label: "Color" },
          starColor: { type: "text", label: "Star Color" },
          mobile: {
            type: "object",
            label: "Mobile Rating Styling",
            objectFields: {
              fontSize: { type: "text", label: "Font Size" },
              color: { type: "text", label: "Color" },
              starColor: { type: "text", label: "Star Color" }
            }
          }
        }
      },
      card: {
        type: "object",
        label: "Card Styling",
        objectFields: {
          backgroundColor: { type: "text", label: "Background Color" },
          borderRadius: { type: "text", label: "Border Radius" },
          padding: { type: "text", label: "Padding" },
          review: {
            type: "object",
            label: "Review Text Styling",
            objectFields: {
              fontSize: { type: "text", label: "Font Size" },
              color: { type: "text", label: "Color" },
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
              lineHeight: { type: "text", label: "Line Height" },
              mobile: {
                type: "object",
                label: "Mobile Review Styling",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
                  color: { type: "text", label: "Color" },
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
                  lineHeight: { type: "text", label: "Line Height" }
                }
              }
            }
          },
          location: {
            type: "object",
            label: "Location Text Styling",
            objectFields: {
              fontSize: { type: "text", label: "Font Size" },
              color: { type: "text", label: "Color" },
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
              lineHeight: { type: "text", label: "Line Height" },
              mobile: {
                type: "object",
                label: "Mobile Location Styling",
                objectFields: {
                  fontSize: { type: "text", label: "Font Size" },
                  color: { type: "text", label: "Color" },
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
                  lineHeight: { type: "text", label: "Line Height" }
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
          backgroundColor: { type: "text", label: "Background Color" },
          textColor: { type: "text", label: "Text Color" },
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
              textColor: { type: "text", label: "Text Color" },
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
  advanceSettings: {
    type: "object",
    label: "Advanced Settings",
    objectFields: {
      ratings: {
        type: "object",
        label: "Ratings",
        objectFields: {
          showGoogleRating: {
            type: "radio",
            label: "Show Google Rating",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          googleRating: {
            type: "number",
            label: "Google Rating Value",
            min: 0,
            max: 5,
            step: 0.1
          },
          googleRatingText: {
            type: "text",
            label: "Google Rating Text (e.g., 4.8/5 on Google Reviews)"
          }
        }
      },
      cardSettings: {
        type: "object",
        label: "Card Settings",
        objectFields: {
          boxShadow: {
            type: "radio",
            label: "Card Box Shadow",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          minHeight: {
            type: "text",
            label: "Card Min Height (e.g., 250px, 200px)"
          },
          mobile: {
            type: "object",
            label: "Mobile Card Settings",
            objectFields: {
              minHeight: {
                type: "text",
                label: "Mobile Card Min Height (e.g., 150px, 120px)"
              }
            }
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
          target: { type: "text", label: "Button Target (e.g., _blank, _self)" },
          rel: { type: "text", label: "Button Rel (e.g., noopener noreferrer)" }
        }
      },
      accessibility: {
        type: "object",
        label: "Accessibility",
        objectFields: {
          ariaLabel: { type: "text", label: "Section Aria Label" },
          role: { type: "text", label: "Section Role" },
          tabIndex: { type: "number", label: "Tab Index" }
        }
      },
      filterModeratedReviews: {
        type: "radio",
        label: "Filter Moderated Reviews",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
      maxTestimonials: {
        type: "number",
        label: "Maximum Number of Testimonials",
        min: 1,
        max: 20
      }
    }
  }
};

export const testimonialsSectionDefaultProps: TestimonialsSectionProps = {
  basicContent: {
    title: "What Our Customers Say",
    subtitle: "Check out our most recent reviews!",
    testimonials: [
      {
        id: "1",
        name: "Sarah Johnson",
        // location: "London",
        rating: 5,
        review: "Good prices, clean, nice staff. Been there 3 times this week trying every one of them is a winner. Just good quality, well prepared, fresh tasty everything. Currently top of my list for Mexican food.",
        // avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
      },
      {
        id: "2",
        name: "John Smith",
        // location: "Manchester",
        rating: 5,
        review: "Excellent pizza! I ordered delivery, a large pepperoni and mushroom and my kid a small pepperoni. Cheese is well proportioned and snappy, crust is crispy and well cooked without being burnt. Toppings were also excellent, loved highly recommend.",
        // avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
      },
      {
        id: "3",
        name: "Emily Davis",
        // location: "Birmingham",
        rating: 5,
        review: "Amazing food and excellent service. The fish and chips were absolutely perfect. Cheese is well proportioned and snappy, crust is crispy and well cooked without being burnt. Toppings were also excellent, loved highly recommend.",
        // avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80"
      }
    ],
    button: {
      text: "View More",
      link: "#reviews"
    }
  },
  styling: {
    layout: {
      maxWidth: "100%",
      backgroundColor: "#FAF9F1"
    },
    spacing: {
      desktop: {
        padding: "40px 30px",
        margin: "0 auto"
      },
      mobile: {
        padding: "24px 16px",
        margin: "0"
      }
    },
    typography: {
      title: {
        fontSize: "32px",
        fontWeight: "600",
        lineHeight: "1.2",
        color: "var(--primary-text)",
        alignment: "center",
        mobile: {
          fontSize: "24px",
          fontWeight: "600",
          lineHeight: "1.2",
          color: "var(--primary-text)"
        }
      },
      subtitle: {
        fontSize: "16px",
        fontWeight: "500",
        lineHeight: "1.5",
        color: "var(--secondary-text)",
        alignment: "center",
        mobile: {
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1.5",
          color: "var(--secondary-text)"
        }
      }
    },
    rating: {
      fontSize: "16px",
      color: "var(--secondary-text)",
      starColor: "var(--rating-bg-primary)",
      alignment: "left",
      mobile: {
        fontSize: "14px",
        color: "var(--secondary-text)",
        starColor: "var(--rating-bg-primary)"
      }
    },
    card: {
      backgroundColor: "var(--cards-containers)",
      borderRadius: "10px",
      padding: "24px",
      review: {
        fontSize: "14px",
        color: "var(--secondary-text)",
        fontWeight: "400",
        lineHeight: "1.5",
        mobile: {
          fontSize: "14px",
          color: "var(--secondary-text)",
          fontWeight: "400",
          lineHeight: "1.5"
        }
      },
      location: {
        fontSize: "16px",
        color: "var(--primary-text)",
        fontWeight: "600",
        lineHeight: "1.5",
        mobile: {
          fontSize: "14px",
          color: "var(--primary-text)",
          fontWeight: "600",
          lineHeight: "1.5"
        }
      }
    },
    button: {
      backgroundColor: "transparent",
      textColor: "var(--primary-text)",
      fontWeight: "600",
      fontSize: "16px",
      height: "48px",
      width: "auto",
      borderRadius: "8px",
      padding: "10px 22px",
      boxShadow: "none",
      mobile: {
        backgroundColor: "transparent",
        textColor: "var(--primary-text)",
        fontWeight: "600",
        fontSize: "14px",
        height: "44px",
        width: "auto",
        borderRadius: "8px",
        padding: "10px 22px",
        boxShadow: "none"
      }
    }
  },
  advanceSettings: {
    ratings: {
      showGoogleRating: true,
      googleRating: 4.8,
      googleRatingText: "4.8/5 on Google Reviews"
    },
    cardSettings: {
      boxShadow: true,
      minHeight: "250px",
      mobile: {
        minHeight: "150px"
      }
    },
    buttonSettings: {
      showButton: true,
      target: "_self",
      rel: "noopener noreferrer"
    },
    accessibility: {
      ariaLabel: "Customer testimonials section",
      role: "region",
      tabIndex: 0
    },
    filterModeratedReviews: false,
    maxTestimonials: 6,
    loading: false,
    error: null,
    totalReviews: 0
  }
};
