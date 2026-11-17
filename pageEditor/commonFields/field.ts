export interface layoutStyling {
  backgroundColor?: string;
  maxWidth?: string;
  mobile?: {
    maxWidth?: string;
    backgroundColor?: string;
  }
}

export interface spacingStyling {
  padding?: string;
  margin?: string;
  mobile?: {
    padding?: string;
    margin?: string;
  }
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

  export interface descriptionStyling {
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



  // Font Weight Options
  export interface fontWeightOptions {
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
    heavy: string;
  }

  // Font Weight Options
  export const fontWeightOptions = [
    { label: "Thin", value: "100" },
    { label: "Extra Light", value: "200" },
    { label: "Light", value: "300" },
    { label: "Normal", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "700" },
    { label: "Extra Bold", value: "800" },
    { label: "Black", value: "900" }
  ];

 // Alignment Options
  export const alignmentOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" }
  ];

  // Title Typography Fields
  export const titleTypographyFields = {
    type: "object" as const,
    label: "Title Typography",
    objectFields: {
      fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 20px" },
      fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
      lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.2" },
      color: { type: "text" as const, label: "Color", placeholder: "e.g., #333333" },
      alignment: {
        type: "radio" as const,
        label: "Alignment",
        options: alignmentOptions
      },
      mobile: {
        type: "object" as const,
        label: "Mobile Typography",
        objectFields: {
          fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 16px" },
          fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
          lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.2" },
          color: { type: "text" as const, label: "Color", placeholder: "e.g., #333333" },
          alignment: {
            type: "radio" as const,
            label: "Alignment",
            options: alignmentOptions
          }
        }
      }
    }
  }

  // Subtitle Typography Fields
  export const subtitleTypographyFields = {
    type: "object" as const,
    label: "Subtitle Typography",
    objectFields: {
      fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 16px" },
      fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
      lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.5" },
      color: { type: "text" as const, label: "Color", placeholder: "e.g., #333333" },
      alignment: {
        type: "radio" as const,
        label: "Alignment",
        options: alignmentOptions
      },
      mobile: {
        type: "object" as const,
        label: "Mobile Typography",
        objectFields: {
          fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 14px" },
          fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
          lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.5" },
          color: { type: "text" as const, label: "Color", placeholder: "e.g., #333333" },
          alignment: {
            type: "radio" as const,
            label: "Alignment",
            options: alignmentOptions
          }
        }
      }
    }
  };

  // Description Typography Fields
  export const descriptionTypographyFields = {
    type: "object" as const,
    label: "Description Typography",
    objectFields: {
      fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 13px" },
      fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
      lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.5" },
      color: { type: "text" as const, label: "Color", placeholder: "e.g., #757575" },
      alignment: {
        type: "radio" as const,
        label: "Alignment",
        options: alignmentOptions
      },
      mobile: {
        type: "object" as const,
        label: "Mobile Typography",
        objectFields: {
          fontSize: { type: "text" as const, label: "Font Size", placeholder: "e.g., 12px" },
          fontWeight: { type: "select" as const, label: "Font Weight", options: fontWeightOptions },
          lineHeight: { type: "text" as const, label: "Line Height", placeholder: "e.g., 1.5" },
          color: { type: "text" as const, label: "Color", placeholder: "e.g., #757575" },
          alignment: {
            type: "radio" as const,
            label: "Alignment",
            options: alignmentOptions
          }
        }
      }
    }
  };

  // Button Action Type Options
  export const actionTypeOptions = [
    { label: "Go to URL", value: "url" },
    { label: "Open Popup", value: "openPopup" }
  ];

  
