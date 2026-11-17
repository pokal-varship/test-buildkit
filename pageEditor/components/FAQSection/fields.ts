import { subtitleStyling, titleStyling } from "../VisitUsSection/fields";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  basicContent?: {
    title?: string;
    subtitle?: string;
  }
  styling?: {
    layout?: {
      backgroundColor?: string;
      maxWidth?: string;
      mobile?: {
        maxWidth?: string;
        backgroundColor?: string;
     }
    }
    spacing?: {
      padding?: string;
      margin?: string;
      mobile?: {
        padding?: string;
        margin?: string;
      }
    }
    typography?: {
      title?: titleStyling;
      subtitle?: subtitleStyling;
      faq?: {
        question?:{
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
        answer?: {
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
      }
    }
  }
  advanceSettings?: {
    faqs?: FAQItem[];
    accordion?: {
      behavior?: {
        allowMultiple?: boolean;
        defaultOpen?: boolean;
      };
      appearance?: {
        showIcons?: boolean;
        iconColor?: string;
        activeIconColor?: string;
        iconSize?: string;
        mobile?: {
          iconSize?: string;
          iconColor?: string;
          activeIconColor?: string;
        }
      };
    };
  }

}

export const faqSectionDefaultProps: FAQSectionProps = {
  basicContent: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know about dining with us",
  },
  styling: {
    layout: {
      backgroundColor: "transparent",
      maxWidth: "100%",
      mobile: {
        maxWidth: "100%",
        backgroundColor: "transparent",
      }
    },
    spacing: {
      padding: "30px 80px",
      margin: "0 auto",
      mobile: {
        padding: "24px 16px",
        margin: "0 auto",
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
          alignment: "center",
        }
      },
      subtitle: {
        fontSize: "16px",
        fontWeight: "400",
        color: "var(--secondary-text)",
        lineHeight: "1.3",
        alignment: "center",
        mobile: {
          fontSize: "14px",
          fontWeight: "400",
          color: "var(--secondary-text)",
          lineHeight: "1.3",
          alignment: "center",
        }
      },
      faq: {
        question: {
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.3",
          mobile: {
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--primary-text)",
            lineHeight: "1.3",
          }
        },
        answer: {
          fontSize: "14px",
          fontWeight: "400",
          color: "var(--secondary-text)",
          lineHeight: "1.3",
          mobile: {
            fontSize: "12px",
            fontWeight: "400",
            color: "var(--secondary-text)",
            lineHeight: "1.3",
          }
        }
      }
    }
  },
  advanceSettings: {
    faqs: [
      {
        question: "Do you accept reservations?",
        answer: "Yes, we accept reservations for parties of all sizes. You can book a table by calling us at +44 20 7123 4567 or using our online booking system. We recommend booking in advance, especially for weekend dinners.",
      },
      {
        question: "Do you offer vegetarian and vegan options?",
        answer: "Absolutely! We have a wide variety of vegetarian and vegan dishes on our menu. Our chefs are happy to accommodate dietary restrictions and preferences.",
      },
      {
        question: "Is parking available?",
        answer: "Yes, we have a small parking area available for our customers. There's also street parking available nearby.",
      },
      {
        question: "What are your opening hours?",
        answer: "We are open Monday to Sunday from 11:00 AM to 10:00 PM. On weekends, we extend our hours until 11:00 PM.",
      },
      {
        question: "Do you offer delivery services?",
        answer: "Yes, we offer delivery through our own delivery service and partner with major food delivery platforms. Delivery times typically range from 30-45 minutes.",
      },
      {
        question: "Can you accommodate large groups?",
        answer: "Yes, we can accommodate large groups and special events. Please contact us in advance to make arrangements and ensure we can provide the best experience for your group.",
      },
    ],
    accordion: {
      behavior: {
        allowMultiple: true,
        defaultOpen: false,
      },
      appearance: {
        showIcons: true,
        iconColor: "var(--primary-text)",
        activeIconColor: "var(--primary-text)",
        iconSize: "20px",
        mobile: {
          iconSize: "18px",
          iconColor: "var(--primary-text)",
          activeIconColor: "var(--primary-text)",
        }
      },
    },
  },
};

export const faqSectionFields = {
  basicContent: {
    type: "object" as const,
    label: "Basic Content",
    objectFields: {
      title: {
        type: "text" as const,
        label: "Section Title",
        placeholder: "Enter FAQ section title",
      },
      subtitle: {
        type: "text" as const,
        label: "Subtitle",
        placeholder: "Enter FAQ section subtitle",
      },
    },
  },
  styling: {
    type: "object" as const,
    label: "Styling",
    objectFields: {
      layout: {
        type: "object" as const,
        label: "Layout Settings",
        objectFields: {
          backgroundColor: {
            type: "text" as const,
            label: "Background Color",
            placeholder: "e.g. #ffffff, white, var(--bg-color)",
          },
          maxWidth: {
            type: "text" as const,
            label: "Max Width (Desktop)",
            placeholder: "e.g. 1200px, 75rem",
          },
          mobile: {
            type: "object" as const,
            label: "Mobile Layout",
            objectFields: {
              maxWidth: {
                type: "text" as const,
                label: "Max Width (Mobile)",
                placeholder: "e.g. 100%, 100vw",
              },
              backgroundColor: {
                type: "text" as const,
                label: "Background Color (Mobile)",
                placeholder: "e.g. #ffffff, white, var(--bg-color)",
              },
            },
          },
        },
      },
      spacing: {
        type: "object" as const,
        label: "Spacing Settings",
        objectFields: {
          padding: {
            type: "text" as const,
            label: "Padding (Desktop)",
            placeholder: "e.g. 80px 20px, 5rem 2rem",
          },
          margin: {
            type: "text" as const,
            label: "Margin (Desktop)",
            placeholder: "e.g. 0, 20px auto",
          },
          mobile: {
            type: "object" as const,
            label: "Mobile Spacing",
            objectFields: {
              padding: {
                type: "text" as const,
                label: "Padding (Mobile)",
                placeholder: "e.g. 40px 16px, 2.5rem 1rem",
              },
              margin: {
                type: "text" as const,
                label: "Margin (Mobile)",
                placeholder: "e.g. 0, 16px auto",
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
                label: "Font Size (Desktop)",
                placeholder: "e.g. 36px, 2.25rem",
              },
              fontWeight: {
                type: "text" as const,
                label: "Font Weight",
                placeholder: "e.g. 600, bold",
              },
              color: {
                type: "text" as const,
                label: "Color",
                placeholder: "e.g. #2d2d2d, var(--primary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g. 1.2, 1.5",
              },
              alignment: {
                type: "text" as const,
                label: "Text Alignment",
                placeholder: "e.g. center, left, right",
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Title Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Font Size (Mobile)",
                    placeholder: "e.g. 24px, 1.5rem",
                  },
                  fontWeight: {
                    type: "text" as const,
                    label: "Font Weight (Mobile)",
                    placeholder: "e.g. 600, bold",
                  },
                  color: {
                    type: "text" as const,
                    label: "Color (Mobile)",
                    placeholder: "e.g. #2d2d2d, var(--primary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Line Height (Mobile)",
                    placeholder: "e.g. 1.3, 1.5",
                  },
                  alignment: {
                    type: "text" as const,
                    label: "Text Alignment (Mobile)",
                    placeholder: "e.g. center, left, right",
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
                label: "Font Size (Desktop)",
                placeholder: "e.g. 16px, 1rem",
              },
              fontWeight: {
                type: "text" as const,
                label: "Font Weight",
                placeholder: "e.g. 400, normal",
              },
              color: {
                type: "text" as const,
                label: "Color",
                placeholder: "e.g. #757575, var(--secondary-text)",
              },
              lineHeight: {
                type: "text" as const,
                label: "Line Height",
                placeholder: "e.g. 1.5, 1.6",
              },
              alignment: {
                type: "text" as const,
                label: "Text Alignment",
                placeholder: "e.g. center, left, right",
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Subtitle Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Font Size (Mobile)",
                    placeholder: "e.g. 14px, 0.875rem",
                  },
                  fontWeight: {
                    type: "text" as const,
                    label: "Font Weight (Mobile)",
                    placeholder: "e.g. 400, normal",
                  },
                  color: {
                    type: "text" as const,
                    label: "Color (Mobile)",
                    placeholder: "e.g. #757575, var(--secondary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Line Height (Mobile)",
                    placeholder: "e.g. 1.5, 1.6",
                  },
                  alignment: {
                    type: "text" as const,
                    label: "Text Alignment (Mobile)",
                    placeholder: "e.g. center, left, right",
                  },
                },
              },
            },
          },
          faq: {
            type: "object" as const,
            label: "FAQ Styling",
            objectFields: {
              question: {
                type: "object" as const,
                label: "Question Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Font Size (Desktop)",
                    placeholder: "e.g. 18px, 1.125rem",
                  },
                  fontWeight: {
                    type: "text" as const,
                    label: "Font Weight",
                    placeholder: "e.g. 600, bold",
                  },
                  color: {
                    type: "text" as const,
                    label: "Color",
                    placeholder: "e.g. #2d2d2d, var(--primary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Line Height",
                    placeholder: "e.g. 1.4, 1.5",
                  },
                  mobile: {
                    type: "object" as const,
                    label: "Mobile Question Styling",
                    objectFields: {
                      fontSize: {
                        type: "text" as const,
                        label: "Font Size (Mobile)",
                        placeholder: "e.g. 16px, 1rem",
                      },
                      fontWeight: {
                        type: "text" as const,
                        label: "Font Weight (Mobile)",
                        placeholder: "e.g. 600, bold",
                      },
                      color: {
                        type: "text" as const,
                        label: "Color (Mobile)",
                        placeholder: "e.g. #2d2d2d, var(--primary-text)",
                      },
                      lineHeight: {
                        type: "text" as const,
                        label: "Line Height (Mobile)",
                        placeholder: "e.g. 1.4, 1.5",
                      },
                    },
                  },
                },
              },
              answer: {
                type: "object" as const,
                label: "Answer Styling",
                objectFields: {
                  fontSize: {
                    type: "text" as const,
                    label: "Font Size (Desktop)",
                    placeholder: "e.g. 16px, 1rem",
                  },
                  fontWeight: {
                    type: "text" as const,
                    label: "Font Weight",
                    placeholder: "e.g. 400, normal",
                  },
                  color: {
                    type: "text" as const,
                    label: "Color",
                    placeholder: "e.g. #757575, var(--secondary-text)",
                  },
                  lineHeight: {
                    type: "text" as const,
                    label: "Line Height",
                    placeholder: "e.g. 1.6, 1.7",
                  },
                  mobile: {
                    type: "object" as const,
                    label: "Mobile Answer Styling",
                    objectFields: {
                      fontSize: {
                        type: "text" as const,
                        label: "Font Size (Mobile)",
                        placeholder: "e.g. 14px, 0.875rem",
                      },
                      fontWeight: {
                        type: "text" as const,
                        label: "Font Weight (Mobile)",
                        placeholder: "e.g. 400, normal",
                      },
                      color: {
                        type: "text" as const,
                        label: "Color (Mobile)",
                        placeholder: "e.g. #757575, var(--secondary-text)",
                      },
                      lineHeight: {
                        type: "text" as const,
                        label: "Line Height (Mobile)",
                        placeholder: "e.g. 1.6, 1.7",
                      },
                    },
                  },
                },
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
      faqs: {
        type: "array" as const,
        label: "FAQ Items",
        arrayFields: {
          question: {
            type: "text" as const,
            label: "Question",
            placeholder: "Enter FAQ question",
          },
          answer: {
            type: "textarea" as const,
            label: "Answer",
            placeholder: "Enter FAQ answer",
          },
        },
        defaultItemProps: {
          question: "New Question",
          answer: "New Answer",
        },
      },
      accordion: {
        type: "object" as const,
        label: "Accordion Settings",
        objectFields: {
          behavior: {
            type: "object" as const,
            label: "Behavior",
            objectFields: {
              allowMultiple: {
                type: "radio" as const,
                label: "Allow Multiple Open",
                options: [
                  { label: "Yes", value: true },
                  { label: "No (Only one at a time)", value: false },
                ],
              },
              defaultOpen: {
                type: "radio" as const,
                label: "Default State",
                options: [
                  { label: "All Closed", value: false },
                  { label: "All Open", value: true },
                ],
              },
            },
          },
          appearance: {
            type: "object" as const,
            label: "Appearance",
            objectFields: {
              showIcons: {
                type: "radio" as const,
                label: "Show Icons",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              iconColor: {
                type: "text" as const,
                label: "Icon Color",
                placeholder: "e.g. #2d2d2d, var(--icon-color)",
              },
              activeIconColor: {
                type: "text" as const,
                label: "Active Icon Color",
                placeholder: "e.g. #2d2d2d, var(--active-color)",
              },
              iconSize: {
                type: "text" as const,
                label: "Icon Size (Desktop)",
                placeholder: "e.g. 20px, 1.25rem",
              },
              mobile: {
                type: "object" as const,
                label: "Mobile Icon Settings",
                objectFields: {
                  iconSize: {
                    type: "text" as const,
                    label: "Icon Size (Mobile)",
                    placeholder: "e.g. 18px, 1.125rem",
                  },
                  iconColor: {
                    type: "text" as const,
                    label: "Icon Color (Mobile)",
                    placeholder: "e.g. #2d2d2d, var(--icon-color)",
                  },
                  activeIconColor: {
                    type: "text" as const,
                    label: "Active Icon Color (Mobile)",
                    placeholder: "e.g. #2d2d2d, var(--active-color)",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}; 