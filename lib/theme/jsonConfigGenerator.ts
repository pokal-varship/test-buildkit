import { ThemeConfig } from 'types/themeConfig.types';

/**
 * Converts ThemeConfig object to JSON string with proper formatting
 */
export const generateJsonConfig = (config: ThemeConfig): string => {
  return JSON.stringify(config, null, 2);
};

/**
 * Converts ThemeConfig to ENV variable format and returns as JSON
 * This structure can be easily sent to an API endpoint
 */
export const generateEnvJson = (config: ThemeConfig): Record<string, string> => {
  const envVars: Record<string, string> = {};

  // Light mode colors
  const lightColors = config.themeColors.light;
  envVars['NEXT_PUBLIC_PRIMARY_BACKGROUND_LIGHT'] = lightColors.primaryBackground;
  envVars['NEXT_PUBLIC_PRIMARY_TEXT_LIGHT'] = lightColors.primaryText;
  envVars['NEXT_PUBLIC_SECONDARY_TEXT_LIGHT'] = lightColors.secondaryText;
  envVars['NEXT_PUBLIC_PRIMARY_COLOR_LIGHT'] = lightColors.primaryColor;
  envVars['NEXT_PUBLIC_CTA_HOVER_LIGHT'] = lightColors.ctaHover;
  envVars['NEXT_PUBLIC_ACCENT_COLOR_LIGHT'] = lightColors.accentColor;
  envVars['NEXT_PUBLIC_SUCCESS_LIGHT'] = lightColors.success;
  envVars['NEXT_PUBLIC_WARNING_LIGHT'] = lightColors.warning;
  envVars['NEXT_PUBLIC_ERROR_LIGHT'] = lightColors.error;
  envVars['NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT'] = lightColors.bordersDividers;
  envVars['NEXT_PUBLIC_CARDS_CONTAINERS_LIGHT'] = lightColors.cardsContainers;
  envVars['NEXT_PUBLIC_PRIMARY_ICON_COLOR_LIGHT'] = lightColors.primaryIconColor;
  envVars['NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_LIGHT'] = lightColors.hoverActiveIconColor;
  envVars['NEXT_PUBLIC_WHITE'] = lightColors.white;
  envVars['NEXT_PUBLIC_BLACK'] = lightColors.black;
  envVars['NEXT_PUBLIC_BORDERS_LIGHT'] = lightColors.borders;
  envVars['NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_LIGHT'] = lightColors.tertiaryButtonHoverBg;
  envVars['NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_LIGHT'] = lightColors.tertiaryActiveBackground;
  envVars['NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_LIGHT'] = lightColors.secondaryActiveBackground;
  envVars['NEXT_PUBLIC_SECONDARY_BACKGROUND_LIGHT'] = lightColors.secondaryBackground;
  envVars['NEXT_PUBLIC_BUTTON_ACTIVE_BG_LIGHT'] = lightColors.buttonActiveBg;
  envVars['NEXT_PUBLIC_WARNING_WITH_OPACITY_LIGHT'] = lightColors.warningWithOpacity;
  envVars['NEXT_PUBLIC_PRIMARY_COLOR_OPACITY'] = lightColors.primaryColorOpacity;  // Shared between modes
  envVars['NEXT_PUBLIC_INNER_ALIGNMENT_BORDER_LIGHT'] = lightColors.innerAlignmentBorder;
  envVars['NEXT_PUBLIC_ORDER_STATUS_BAR_LIGHT'] = lightColors.orderStatusBar;
  envVars['NEXT_PUBLIC_FREEBIES_BG_LIGHT'] = lightColors.freebiesBg;
  envVars['NEXT_PUBLIC_FREEBIE_TAG_LIGHT'] = lightColors.freebieTag;
  envVars['NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_START'] = lightColors.productOfferBgStart;
  envVars['NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_END'] = lightColors.productOfferBgEnd;

  // Light mode rating colors
  const lightRating = lightColors.ratingColors;
  envVars['NEXT_PUBLIC_BG_PRIMARY_LIGHT'] = lightRating.bgPrimaryLight;
  envVars['NEXT_PUBLIC_BG_SECONDARY_LIGHT'] = lightRating.bgSecondaryLight;
  envVars['NEXT_PUBLIC_BG_SUCCESS_PRIMARY_LIGHT'] = lightRating.bgSuccessPrimaryLight;
  envVars['NEXT_PUBLIC_BG_SUCCESS_PRIMARY_TRANSPARENT'] = lightRating.bgSuccessPrimaryTransparent;
  envVars['NEXT_PUBLIC_BG_SUCCESS_SECONDARY_LIGHT'] = lightRating.bgSuccessSecondaryLight;
  envVars['NEXT_PUBLIC_BG_WARNING_PRIMARY_LIGHT'] = lightRating.bgWarningPrimaryLight;
  envVars['NEXT_PUBLIC_BG_WARNING_PRIMARY_TRANSPARENT'] = lightRating.bgWarningPrimaryTransparent;
  envVars['NEXT_PUBLIC_BG_WARNING_SECONDARY_LIGHT'] = lightRating.bgWarningSecondaryLight;
  envVars['NEXT_PUBLIC_BG_ERROR_PRIMARY_LIGHT'] = lightRating.bgErrorPrimaryLight;
  envVars['NEXT_PUBLIC_BG_ERROR_PRIMARY_TRANSPARENT'] = lightRating.bgErrorPrimaryTransparent;
  envVars['NEXT_PUBLIC_BORDER_PRIMARY_LIGHT'] = lightRating.borderPrimaryLight;
  envVars['NEXT_PUBLIC_BORDER_SECONDARY_LIGHT'] = lightRating.borderSecondaryLight;
  envVars['NEXT_PUBLIC_BORDER_SECONDARY_DARK'] = lightRating.borderSecondaryDark;

  // Dark mode colors
  const darkColors = config.themeColors.dark;
  envVars['NEXT_PUBLIC_PRIMARY_BACKGROUND_DARK'] = darkColors.primaryBackground;
  envVars['NEXT_PUBLIC_PRIMARY_TEXT_DARK'] = darkColors.primaryText;
  envVars['NEXT_PUBLIC_SECONDARY_TEXT_DARK'] = darkColors.secondaryText;
  envVars['NEXT_PUBLIC_PRIMARY_COLOR_DARK'] = darkColors.primaryColor;
  envVars['NEXT_PUBLIC_CTA_HOVER_DARK'] = darkColors.ctaHover;
  envVars['NEXT_PUBLIC_ACCENT_COLOR_DARK'] = darkColors.accentColor;
  envVars['NEXT_PUBLIC_SUCCESS_DARK'] = darkColors.success;
  envVars['NEXT_PUBLIC_WARNING_DARK'] = darkColors.warning;
  envVars['NEXT_PUBLIC_ERROR_DARK'] = darkColors.error;
  envVars['NEXT_PUBLIC_BORDERS_DIVIDERS_DARK'] = darkColors.bordersDividers;
  envVars['NEXT_PUBLIC_CARDS_CONTAINERS_DARK'] = darkColors.cardsContainers;
  envVars['NEXT_PUBLIC_PRIMARY_ICON_COLOR_DARK'] = darkColors.primaryIconColor;
  envVars['NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_DARK'] = darkColors.hoverActiveIconColor;
  envVars['NEXT_PUBLIC_BORDERS_DARK'] = darkColors.borders;
  envVars['NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_DARK'] = darkColors.tertiaryButtonHoverBg;
  envVars['NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_DARK'] = darkColors.tertiaryActiveBackground;
  envVars['NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_DARK'] = darkColors.secondaryActiveBackground;
  envVars['NEXT_PUBLIC_SECONDARY_BACKGROUND_DARK'] = darkColors.secondaryBackground;
  envVars['NEXT_PUBLIC_BUTTON_ACTIVE_BG_DARK'] = darkColors.buttonActiveBg;
  envVars['NEXT_PUBLIC_WARNING_WITH_OPACITY_DARK'] = darkColors.warningWithOpacity;
  // Note: PRIMARY_COLOR_OPACITY is shared between modes, already set from light mode
  envVars['NEXT_PUBLIC_INNER_ALIGNMENT_BORDER_DARK'] = darkColors.innerAlignmentBorder;
  envVars['NEXT_PUBLIC_ORDER_STATUS_BAR_DARK'] = darkColors.orderStatusBar;
  envVars['NEXT_PUBLIC_FREEBIES_BG_DARK'] = darkColors.freebiesBg;
  envVars['NEXT_PUBLIC_FREEBIE_TAG_DARK'] = darkColors.freebieTag;
  envVars['NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_START'] = darkColors.productOfferBgStart;
  envVars['NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_END'] = darkColors.productOfferBgEnd;

  // Dark mode rating colors
  const darkRating = darkColors.ratingColors;
  envVars['NEXT_PUBLIC_BG_PRIMARY_DARK'] = darkRating.bgPrimaryLight;
  envVars['NEXT_PUBLIC_BG_SECONDARY_DARK'] = darkRating.bgSecondaryLight;
  envVars['NEXT_PUBLIC_BG_SUCCESS_PRIMARY_DARK'] = darkRating.bgSuccessPrimaryLight;
  envVars['NEXT_PUBLIC_BG_SUCCESS_SECONDARY_DARK'] = darkRating.bgSuccessSecondaryLight;
  envVars['NEXT_PUBLIC_BG_WARNING_PRIMARY_DARK'] = darkRating.bgWarningPrimaryLight;
  envVars['NEXT_PUBLIC_BG_WARNING_SECONDARY_DARK'] = darkRating.bgWarningSecondaryLight;
  envVars['NEXT_PUBLIC_BG_ERROR_PRIMARY_DARK'] = darkRating.bgErrorPrimaryLight;

  // Font settings
  envVars['NEXT_PUBLIC_FONT_FAMILY'] = config.fontFamily;
  envVars['NEXT_PUBLIC_BASE_FONT_SIZE'] = config.baseFontSize;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_LIGHT'] = config.fontWeights.light;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_REGULAR'] = config.fontWeights.regular;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_MEDIUM'] = config.fontWeights.medium;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_SEMIBOLD'] = config.fontWeights.semiBold;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_BOLD'] = config.fontWeights.bold;
  envVars['NEXT_PUBLIC_FONT_WEIGHT_EXTRABOLD'] = config.fontWeights.extraBold;

  // Font sizes
  envVars['NEXT_PUBLIC_FONT_SIZE_XSS'] = config.fontSizes.xss;
  envVars['NEXT_PUBLIC_FONT_SIZE_SMALL'] = config.fontSizes.small;
  envVars['NEXT_PUBLIC_FONT_SIZE_DESCRIPTION'] = config.fontSizes.description;
  envVars['NEXT_PUBLIC_FONT_SIZE_H1'] = config.fontSizes.h1;
  envVars['NEXT_PUBLIC_FONT_SIZE_H2'] = config.fontSizes.h2;
  envVars['NEXT_PUBLIC_FONT_SIZE_H3'] = config.fontSizes.h3;
  envVars['NEXT_PUBLIC_FONT_SIZE_H4'] = config.fontSizes.h4;
  envVars['NEXT_PUBLIC_FONT_SIZE_H5'] = config.fontSizes.h5;
  envVars['NEXT_PUBLIC_FONT_SIZE_H6'] = config.fontSizes.h6;

  // Button styles - Light mode
  const lightPrimary = config.buttonStyles.light.primary;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BG_LIGHT'] = lightPrimary.background;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_LIGHT'] = lightPrimary.text;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_LIGHT'] = lightPrimary.hoverBackground;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_LIGHT'] = lightPrimary.hoverText;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_LIGHT'] = lightPrimary.borderColor;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_LIGHT'] = lightPrimary.borderWidth;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_LIGHT'] = lightPrimary.fontSize;

  const lightSecondary = config.buttonStyles.light.secondary;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BG_LIGHT'] = lightSecondary.background;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_LIGHT'] = lightSecondary.text;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_LIGHT'] = lightSecondary.hoverBackground;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_LIGHT'] = lightSecondary.hoverText;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_LIGHT'] = lightSecondary.borderColor;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_LIGHT'] = lightSecondary.borderWidth;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_LIGHT'] = lightSecondary.fontSize;

  // Button styles - Dark mode
  const darkPrimary = config.buttonStyles.dark.primary;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BG_DARK'] = darkPrimary.background;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_DARK'] = darkPrimary.text;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_DARK'] = darkPrimary.hoverBackground;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_DARK'] = darkPrimary.hoverText;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_DARK'] = darkPrimary.borderColor;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_DARK'] = darkPrimary.borderWidth;
  envVars['NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_DARK'] = darkPrimary.fontSize;

  const darkSecondary = config.buttonStyles.dark.secondary;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BG_DARK'] = darkSecondary.background;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_DARK'] = darkSecondary.text;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_DARK'] = darkSecondary.hoverBackground;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_DARK'] = darkSecondary.hoverText;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_DARK'] = darkSecondary.borderColor;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_DARK'] = darkSecondary.borderWidth;
  envVars['NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_DARK'] = darkSecondary.fontSize;

  return envVars;
};

/**
 * Downloads the configuration as a JSON file
 */
export const downloadJsonFile = (config: ThemeConfig, filename: string = 'theme-config.json') => {
  const jsonContent = generateJsonConfig(config);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads the ENV format as a JSON file (key-value pairs)
 */
export const downloadEnvJsonFile = (config: ThemeConfig, filename: string = 'theme-env.json') => {
  const envVars = generateEnvJson(config);
  const jsonContent = JSON.stringify(envVars, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Saves configuration to localStorage (for client-side persistence)
 */
export const saveToLocalStorage = (config: ThemeConfig, key: string = 'theme-config') => {
  try {
    const jsonString = generateJsonConfig(config);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Loads configuration from localStorage
 */
export const loadFromLocalStorage = (key: string = 'theme-config'): ThemeConfig | null => {
  try {
    const jsonString = localStorage.getItem(key);
    if (jsonString) {
      return JSON.parse(jsonString) as ThemeConfig;
    }
    return null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

