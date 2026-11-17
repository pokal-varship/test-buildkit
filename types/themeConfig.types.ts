// Theme Configuration Types
// Based on TENANT_CONFIG_COLORS_AND_FONTS.md

export interface RatingColors {
  bgPrimaryLight: string;
  bgSecondaryLight: string;
  bgSuccessPrimaryLight: string;
  bgSuccessPrimaryTransparent: string;
  bgSuccessSecondaryLight: string;
  bgWarningPrimaryLight: string;
  bgWarningPrimaryTransparent: string;
  bgWarningSecondaryLight: string;
  bgErrorPrimaryLight: string;
  bgErrorPrimaryTransparent: string;
  borderPrimaryLight: string;
  borderSecondaryLight: string;
  borderSecondaryDark: string;
}

export interface ThemeColors {
  // Core Theme Colors
  primaryBackground: string;
  primaryText: string;
  secondaryText: string;
  primaryColor: string;
  ctaHover: string;
  accentColor: string;
  success: string;
  warning: string;
  error: string;
  bordersDividers: string;
  cardsContainers: string;
  primaryIconColor: string;
  hoverActiveIconColor: string;
  white: string;
  black: string;
  
  // Additional Theme Colors
  borders: string;
  tertiaryButtonHoverBg: string;
  tertiaryActiveBackground: string;
  secondaryActiveBackground: string;
  secondaryBackground: string;
  buttonActiveBg: string;
  warningWithOpacity: string;
  primaryColorOpacity: string;
  innerAlignmentBorder: string;
  orderStatusBar: string;
  
  // Freebie Colors
  freebiesBg: string;
  freebieTag: string;
  
  // Product Offer Colors
  productOfferBgStart: string;
  productOfferBgEnd: string;
  
  // Rating Colors (nested)
  ratingColors: RatingColors;
}

export interface ButtonStyle {
  background: string;
  text: string;
  hoverBackground: string;
  hoverText: string;
  borderColor: string;
  borderWidth: string;
  fontSize: string;
}

export interface ButtonStyles {
  primary: ButtonStyle;
  secondary: ButtonStyle;
}

export interface FontWeights {
  light: string;
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
  extraBold: string;
}

export interface FontSizes {
  xss: string;
  small: string;
  description: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
}

export interface ThemeConfig {
  themeColors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  fontFamily: string;
  baseFontSize: string;
  fontWeights: FontWeights;
  fontSizes: FontSizes;
  buttonStyles: {
    light: ButtonStyles;
    dark: ButtonStyles;
  };
}

export type ThemeMode = 'light' | 'dark';

// For ENV file generation
export interface EnvVariable {
  key: string;
  value: string;
  category: string;
  description?: string;
}

