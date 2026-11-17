import { descriptionStyling, descriptionTypographyFields, layoutStyling, spacingStyling, subtitleStyling, subtitleTypographyFields, titleStyling, titleTypographyFields } from "pageEditor/commonFields/field";

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  // experience: string;
  // description: string;
  image: string;
  socialUrl?: {
    facebookUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    [key: string]: string | undefined;
  };
}

export interface MeetOurTeamSectionProps {
  basicContent?: {
    title?: string;
    subtitle?: string;
  };
  styling?: {
    layout?: layoutStyling;
    spacing?: spacingStyling;
    typography?: {
      title?: titleStyling;
      subtitle?: subtitleStyling;
    };
    card?: {
      backgroundColor?: string;
      borderRadius?: string;
      borderColor?: string;
      boxShadow?: string;
      title?: titleStyling;
      designation?: subtitleStyling;
    };
  };
  advanceSettings?: {
    teamMembers?: TeamMember[];
    loading?: boolean;
    error?: string | null;
    totalCount?: number;
    showSocialLinks?: string | boolean;
  };
}

export const meetOurTeamSectionFields = {
  basicContent: {
    type: "object" as const,
    label: "Basic Content",
    objectFields: {
      title: { type: "text" as const, label: "Section Title", placeholder: "e.g., Meet Our Team" },
      subtitle: { type: "text" as const, label: "Section Subtitle", placeholder: "e.g., The passionate people behind your exceptional dining experience" },
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
      card: {
        type: "object" as const,
        label: "Card Styling",
        objectFields: {
          backgroundColor: { type: "text" as const, label: "Background Color", placeholder: "e.g., #ffffff" },
          borderRadius: { type: "text" as const, label: "Border Radius", placeholder: "e.g., 12px" },
          borderColor: { type: "text" as const, label: "Border Color", placeholder: "e.g., #ffffff" },
          boxShadow: { type: "text" as const, label: "Box Shadow", placeholder: "e.g., 0 2px 8px rgba(0,0,0,0.06)" },
          title: titleTypographyFields,
          designation: subtitleTypographyFields,
        },
      },
    },
  },
  advanceSettings: {
    type: "object" as const,
    label: "Advanced Settings",
    objectFields: {
      showSocialLinks: { 
        type: "radio" as const, 
        label: "Show Social Links", 
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" }
        ]
      },
    },
  },
};

export const meetOurTeamSectionDefaultProps: MeetOurTeamSectionProps = {
  basicContent: {
    title: "Meet Our Team",
    subtitle: "The passionate people behind your exceptional dining experience"
  },
  styling: {
    layout: {
      backgroundColor: "transparent",
      maxWidth: "100%",
      mobile: {
        backgroundColor: "transparent",
        maxWidth: "100%"
      }
    },
    spacing: {
      padding: "30px 30px",
      margin: "0 auto",
      mobile: {
        padding: "24px 16px",
        margin: "0 auto"
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
          fontSize: "32px",
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
    card: {
      backgroundColor: "var(--cards-containers)",
      borderRadius: "10px",
      borderColor: "var(--rating-border-primary)",
      boxShadow: "none",
      title: {
        fontSize: "18px",
        fontWeight: "600",
        color: "var(--primary-text)",
        lineHeight: "1.2",
        alignment: "left",
        mobile: {
          fontSize: "16px",
          fontWeight: "600",
          color: "var(--primary-text)",
          lineHeight: "1.2",
          alignment: "left"
        }
      },
      designation: {
        fontSize: "16px",
        fontWeight: "500",
        color: "var(--primary-color)",
        lineHeight: "1.2",
        alignment: "left",
        mobile: {
          fontSize: "14px",
          fontWeight: "500",
          color: "var(--primary-color)",
          lineHeight: "1.2",
          alignment: "left"
        }
      },
    }
  },
  advanceSettings: {
    teamMembers: [],
    loading: false,
    error: null,
    totalCount: 0,
    showSocialLinks: "true"
  }
};

// Explicit export to ensure module compatibility
export { meetOurTeamSectionFields as fields, meetOurTeamSectionDefaultProps as defaultProps }; 