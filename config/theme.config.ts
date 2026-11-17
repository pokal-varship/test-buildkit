const config = {
  light: {
    "primary-background-light":
      process.env.NEXT_PUBLIC_PRIMARY_BACKGROUND_LIGHT,
    "primary-text-light": process.env.NEXT_PUBLIC_PRIMARY_TEXT_LIGHT,
    "primary-text-light-2": process.env.NEXT_PUBLIC_PRIMARY_TEXT_LIGHT_2,
    "secondary-text-light": process.env.NEXT_PUBLIC_SECONDARY_TEXT_LIGHT,
    "primary-color-light": process.env.NEXT_PUBLIC_PRIMARY_COLOR_LIGHT,
    "cta-hover-light": process.env.NEXT_PUBLIC_CTA_HOVER_LIGHT,
    "accent-color-light": process.env.NEXT_PUBLIC_ACCENT_COLOR_LIGHT,
    "success-light": process.env.NEXT_PUBLIC_SUCCESS_LIGHT,
    "offer-details-light": process.env.NEXT_PUBLIC_OFFER_DETAILS_LIGHT,
    "warning-light": process.env.NEXT_PUBLIC_WARNING_LIGHT,
    "warning-opac-light": process.env.NEXT_PUBLIC_WARNING_WITH_OPACITY_LIGHT,
    "error-light": process.env.NEXT_PUBLIC_ERROR_LIGHT,
    "borders-dividers-light": process.env.NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT,
    "borders-light": process.env.NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT,
    "cards-containers-light": process.env.NEXT_PUBLIC_CARDS_CONTAINERS_LIGHT,
    "primary-icon-color-light":
      process.env.NEXT_PUBLIC_PRIMARY_ICON_COLOR_LIGHT,
    "hover-active-icon-color-light":
      process.env.NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_LIGHT,
    "white-light": process.env.NEXT_PUBLIC_WHITE_LIGHT,
    "black-light": process.env.NEXT_PUBLIC_BLACK_LIGHT,
    "secondary-background-light":
      process.env.NEXT_PUBLIC_SECONDARY_BACKGROUND_LIGHT,
    "background-tertiary-light": process.env.NEXT_PUBLIC_WHITE_DARK,
    "inner-allignment-border-light":
      process.env.NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_LIGHT,
    "secondary-active-background-light":
      process.env.NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_LIGHT,
    "tertiary-active-background-light":
      process.env.NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_LIGHT,
    "primary-active-background-light":
      process.env.NEXT_PUBLIC_PRIMARY_ACTIVE_BACKGROUND_LIGHT,
    "primary-color-opacity-light":
      process.env.NEXT_PUBLIC_PRIMARY_COLOR_OPACITY,
    "center-alignment-light": process.env.NEXT_PUBLIC_ORDER_STATUS_BAR_LIGHT,
    "success-opacity-light": `${process.env.NEXT_PUBLIC_SUCCESS_LIGHT}26`,
    "accent-color-opacity-light": `${process.env.NEXT_PUBLIC_ACCENT_COLOR_LIGHT}10`,
    "border-light":process.env.NEXT_PUBLIC_BORDERS_LIGHT,
    "freebies-background-light": process.env.NEXT_PUBLIC_FREEBIES_BG_LIGHT,
    "product-offer-bg-start-light": process.env.NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_START,
    "product-offer-bg-end-light": process.env.NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_END,
    "freebie-tag-color-light": process.env.NEXT_PUBLIC_FREEBIE_TAG_LIGHT,
    "order-type-badge-bg-light": process.env.NEXT_PUBLIC_ORDER_TYPE_BADGE_BG,
    "loyalty-badge-bg-light": "#A03DFB",
    "transaction-history-bg-light": '#EEE8D9',
    "order-summary-bg-light": "#F6F6F6",
    rating: { 
      primary: process.env.NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT,
      secondary: process.env.NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT,
      successPrimary: process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT,
      successSecondary:
        process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT,
      warningPrimary: process.env.NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT,
      warningSecondary:
        process.env.NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT,
      errorPrimary: process.env.NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT,
      border: process.env.NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT,
      successOpacity:
        process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT,
      warningOpacity:
        process.env.NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT,
      erorrOpacity: process.env.NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT,
      borderSecondary: process.env.NEXT_PUBLIC_RATING_BORDER_SECONDARY_LIGHT,
      secondaryOpacity: process.env.NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_OPACITY,
      borderPrimary: process.env.NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT,
    },
    offerTheme: {
      offerType2: { background: "#E2F2E7", text: "#175F31" },
      offerType3: { background: "#E5EDFD", text: "#233B96" },
      offerType4: { background: "#C5F9EF", text: "#2F8079" },
      offerType5: { background: "#FDEEE3", text: "#AE461B" },
      default: {
        background: `${process.env.NEXT_PUBLIC_SUCCESS_LIGHT}26`,
        text: process.env.NEXT_PUBLIC_SUCCESS_LIGHT,
      },
    },
  },
  dark: {
    "primary-background-dark": process.env.NEXT_PUBLIC_PRIMARY_BACKGROUND_DARK,
    "primary-text-dark": process.env.NEXT_PUBLIC_PRIMARY_TEXT_DARK,
    "secondary-text-dark": process.env.NEXT_PUBLIC_SECONDARY_TEXT_DARK,
    "primary-color-dark": process.env.NEXT_PUBLIC_PRIMARY_COLOR_DARK,
    "cta-hover-dark": process.env.NEXT_PUBLIC_CTA_HOVER_DARK,
    "accent-color-dark": process.env.NEXT_PUBLIC_ACCENT_COLOR_DARK,
    "accent-color-opacity-dark": `${process.env.NEXT_PUBLIC_ACCENT_COLOR_DARK}10`,
    "success-dark": process.env.NEXT_PUBLIC_SUCCESS_DARK,
    "warning-dark": process.env.NEXT_PUBLIC_WARNING_DARK,
    "warning-opac-dark": process.env.NEXT_PUBLIC_WARNING_WITH_OPACITY_DARK,
    "error-dark": process.env.NEXT_PUBLIC_ERROR_DARK,
    "borders-dividers-dark": process.env.NEXT_PUBLIC_BORDERS_DIVIDERS_DARK,
    "cards-containers-dark": process.env.NEXT_PUBLIC_CARDS_CONTAINERS_DARK,
    "borders-dark": process.env.NEXT_PUBLIC_CARDS_CONTAINERS_DARK,
    "primary-icon-color-dark": process.env.NEXT_PUBLIC_PRIMARY_ICON_COLOR_DARK,
    "hover-active-icon-color-dark":
      process.env.NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_DARK,
    "white-dark": process.env.NEXT_PUBLIC_WHITE_DARK,
    "black-dark": process.env.NEXT_PUBLIC_BLACK_DARK,
    "secondary-background-dark":
      process.env.NEXT_PUBLIC_SECONDARY_BACKGROUND_DARK,
    "background-tertiary-dark": process.env.NEXT_PUBLIC_BLACK_DARK,
    "inner-allignment-border-dark":
      process.env.NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_DARK,
    "secondary-active-background-dark":
      process.env.NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_DARK,
    "tertiary-active-background-dark":
      process.env.NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_DARK,
    "primary-active-background-dark":
      process.env.NEXT_PUBLIC_PRIMARY_ACTIVE_BACKGROUND_DARK,
    "primary-color-opacity-dark": process.env.NEXT_PUBLIC_PRIMARY_COLOR_OPACITY,
    "center-alignment-dark": process.env.NEXT_PUBLIC_ORDER_STATUS_BAR_DARK,
    "success-opacity-dark": `${process.env.NEXT_PUBLIC_SUCCESS_DARK}26`,
    "border-dark":process.env.NEXT_PUBLIC_BORDERS_DARK,
    "freebies-background-dark": process.env.NEXT_PUBLIC_FREEBIES_BG_DARK,
    "product-offer-bg-start-dark": process.env.NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_START,
    "product-offer-bg-end-dark": process.env.NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_END,
    "freebie-tag-color-dark": process.env.NEXT_PUBLIC_FREEBIE_TAG_DARK,
    "order-type-badge-bg-dark": process.env.NEXT_PUBLIC_ORDER_TYPE_BADGE_BG,
    "transaction-history-bg-dark": "#26211A",
    "loyalty-badge-bg-dark": "#A03DFB",
    "order-summary-bg-dark": "#1E1E1E",
    rating: {
      primary: process.env.NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT,
      secondary: process.env.NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT,
      successPrimary: process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT,
      successSecondary:
        process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT,
      warningPrimary: process.env.NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT,
      warningSecondary:
        process.env.NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT,
      errorPrimary: process.env.NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT,
      border: process.env.NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT,
      successOpacity:
        process.env.NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT,
      warningOpacity:
        process.env.NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT,
      erorrOpacity: process.env.NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT,
      borderSecondary: process.env.NEXT_PUBLIC_RATING_BORDER_SECONDARY_DARK,
      secondaryOpacity: process.env.NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_OPACITY,
      borderPrimary: process.env.NEXT_PUBLIC_ORDER_STATUS_BAR_DARK,
    },
    offerTheme: {
      offerType2: { background: "#16291C", text: "#30B25F" },
      offerType3: { background: "#171D2A", text: "#718EFF" },
      offerType4: { background: "#172A27", text: "#43B9AF" },
      offerType5: { background: "#2B1F17", text: "#AE461B" },
      default: {
        background: `${process.env.NEXT_PUBLIC_SUCCESS_DARK}26`,
        text: process.env.NEXT_PUBLIC_SUCCESS_DARK,
      },
    },
  },
  fontStyles: {
    baseFontSize: process.env.NEXT_PUBLIC_BASE_FONT_SIZE,
    weights: {
      light: process.env.NEXT_PUBLIC_FONT_LIGHT,
      regular: process.env.NEXT_PUBLIC_FONT_REGULAR,
      medium: process.env.NEXT_PUBLIC_FONT_MEDIUM,
      semiBold: process.env.NEXT_PUBLIC_FONT_SEMI_BOLD,
      bold: process.env.NEXT_PUBLIC_FONT_BOLD,
      extraBold: process.env.NEXT_PUBLIC_FONT_EXTRA_BOLD,
    },
    headings: {
      h1: process.env.NEXT_PUBLIC_HEADING_H1,
      h2: process.env.NEXT_PUBLIC_HEADING_H2,
      h3: process.env.NEXT_PUBLIC_HEADING_H3,
      h4: process.env.NEXT_PUBLIC_HEADING_H4,
      h5: process.env.NEXT_PUBLIC_HEADING_H5,
      h6: process.env.NEXT_PUBLIC_HEADING_H6,
    },
    text: {
      description: process.env.NEXT_PUBLIC_DESCRIPTION_FONT,
      small: process.env.NEXT_PUBLIC_SMALL_FONT,
      extraSmall: process.env.NEXT_PUBLIC_EXTRA_SMALL_FONT,
    },
  },
  fontFamily: {
    primary: `${process.env.NEXT_PUBLIC_FONT_FAMILY}, sans-serif`,
  },
  buttonPrimaryLight: {
    background: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BG_LIGHT,
    text: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_LIGHT,
    hoverText: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_LIGHT,
    hoverBackground: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_LIGHT,
    fontSize: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_LIGHT,
    borderColor: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_LIGHT,
    borderWidth: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_LIGHT,
    activeBackground: process.env.NEXT_PUBLIC_BUTTON_ACTIVE_BG_LIGHT,
  },
  buttonPrimaryDark: {
    background: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BG_DARK,
    text: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_DARK,
    hoverText: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_DARK,
    hoverBackground: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_DARK,
    fontSize: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_DARK,
    borderColor: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_DARK,
    borderWidth: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_DARK,
    activeBackground: process.env.NEXT_PUBLIC_BUTTON_ACTIVE_BG_DARK,
  },
  buttonSecondary: {
    background: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BG_LIGHT,
    text: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_LIGHT,
    hoverText: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_LIGHT,
    hoverBackground: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_LIGHT,
    fontSize: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_LIGHT,
    borderColor: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_LIGHT,
    borderWidth: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_LIGHT,
    tertiaryHoverBg: process.env.NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_LIGHT,
  },
  buttonSecondaryDark: {
    background: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BG_DARK,
    text: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_DARK,
    hoverText: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_DARK,
    hoverBackground: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_DARK,
    fontSize: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_DARK,
    borderColor: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_DARK,
    borderWidth: process.env.NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_DARK,
    tertiaryHoverBg: process.env.NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_DARK,
  },
  imageBaseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
  sliderArrow: {
    light: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_LIGHT,
    dark: process.env.NEXT_PUBLIC_BUTTON_PRIMARY_BG_DARK,
  },
  headerLink:{
    hoverBackgroundLight: process.env.NEXT_PUBLIC_HEADER_LINK_HOVER_BACKGROUND_LIGHT,
    hoverBackgroundDark: process.env.NEXT_PUBLIC_CARDS_CONTAINERS_DARK,
  },
  wishlistHeartColor: {
    light: process.env.NEXT_PUBLIC_PRIMARY_TEXT_LIGHT,
    dark: process.env.NEXT_PUBLIC_WISHLIST_HEART_COLOR_DARK,
  },
  /** Dine-in order info box colors (same for light and dark mode) */
  dineInInfoBox: {
    border: process.env.NEXT_PUBLIC_DINEIN_INFO_BORDER,
    background: process.env.NEXT_PUBLIC_DINEIN_INFO_BG,
    text: process.env.NEXT_PUBLIC_DINEIN_INFO_TEXT,
  },
};

export const getThemeConfig = () => {
    return config;
}

export default config;  
