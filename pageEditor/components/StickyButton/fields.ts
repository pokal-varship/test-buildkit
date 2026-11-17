import type { Fields } from "@measured/puck";

export interface StickyButtonProps {
  basicContent?: {
    text?: string;
    link?: string;
    target?: string;
    rel?: string;
  };
  styling?: {
    backgroundColor?: string;
    hoverBackgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: string;
  };
  behavior?: {
    showWhenBannerHidden?: boolean;
    scrollThreshold?: number;
    animationDuration?: number;
    showOnMobile?: boolean;
  };
}

export const stickyButtonFields: Fields<StickyButtonProps> = {
  basicContent: {
    type: "object",
    label: "Basic Content",
    objectFields: {
      text: {
        type: "text",
        label: "Button Text",
        placeholder: "Enter button text"
      },
      link: {
        type: "text",
        label: "Button Link",
        placeholder: "Enter button link (URL)"
      },
      target: {
        type: "select",
        label: "Link Target",
        options: [
          { label: "Same Window", value: "_self" },
          { label: "New Window", value: "_blank" },
        ]
      },
      rel: {
        type: "text",
        label: "Rel Attribute",
        placeholder: "e.g., noopener noreferrer"
      },
    }
  },
  styling: {
    type: "object",
    label: "Styling",
    objectFields: {
      backgroundColor: {
        type: "text",
        label: "Background Color",
        placeholder: "e.g., #fbbf24"
      },
      hoverBackgroundColor: {
        type: "text",
        label: "Hover Background Color",
        placeholder: "e.g., #fbbf24"
      },
      textColor: {
        type: "text",
        label: "Text Color",
        placeholder: "e.g., #000000"
      },
      fontSize: {
        type: "text",
        label: "Font Size",
        placeholder: "e.g., 16px"
      },
      fontWeight: {
        type: "select",
        label: "Font Weight",
        options: [
          { label: "Normal", value: "400" },
          { label: "Medium", value: "500" },
          { label: "Semi Bold", value: "600" },
          { label: "Bold", value: "700" },
        ]
      },
      padding: {
        type: "text",
        label: "Padding",
        placeholder: "e.g., 12px 24px"
      },
      borderRadius: {
        type: "text",
        label: "Border Radius",
        placeholder: "e.g., 8px"
      },
      boxShadow: {
        type: "text",
        label: "Box Shadow",
        placeholder: "e.g., 0 4px 12px rgba(0, 0, 0, 0.15)"
      },
      zIndex: {
        type: "text",
        label: "Z-Index",
        placeholder: "e.g., 1000"
      },
    }
  },
  behavior: {
    type: "object",
    label: "Behavior",
    objectFields: {
      showWhenBannerHidden: {
        type: "radio",
        label: "Show When Banner Hidden",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
      scrollThreshold: {
        type: "number",
        label: "Scroll Threshold (px)",
        min: 0,
        step: 1
      },
      animationDuration: {
        type: "number",
        label: "Animation Duration (ms)",
        min: 0,
        step: 1
      },
      showOnMobile: {
        type: "radio",
        label: "Show On Mobile",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false }
        ]
      },
    }
  },
}; 