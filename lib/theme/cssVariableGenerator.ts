import { ThemeConfig, ThemeMode } from "types/themeConfig.types";

/**
 * Generates CSS variables from theme configuration
 * Applies !important flag to override existing styles
 */
export function generateCssVariables(config: ThemeConfig, mode: ThemeMode): string {
  const colors = mode === 'light' ? config.themeColors.light : config.themeColors.dark;
  const buttonStyles = config.buttonStyles[mode];
  
  const cssVars: string[] = [];
  
  // Core Colors
  cssVars.push(`--primary-background: ${colors.primaryBackground} !important;`);
  cssVars.push(`--primary-text: ${colors.primaryText} !important;`);
  cssVars.push(`--primary-text-light: ${config.themeColors.light.primaryText} !important;`);
  cssVars.push(`--secondary-text: ${colors.secondaryText} !important;`);
  cssVars.push(`--primary-color: ${colors.primaryColor} !important;`);
  cssVars.push(`--cta-hover: ${colors.ctaHover} !important;`);
  cssVars.push(`--accent-color: ${colors.accentColor} !important;`);
  cssVars.push(`--success: ${colors.success} !important;`);
  cssVars.push(`--warning: ${colors.warning} !important;`);
  cssVars.push(`--error: ${colors.error} !important;`);
  cssVars.push(`--borders-dividers: ${colors.bordersDividers} !important;`);
  cssVars.push(`--cards-containers: ${colors.cardsContainers} !important;`);
  cssVars.push(`--primary-icon-color: ${colors.primaryIconColor} !important;`);
  cssVars.push(`--hover-active-icon-color: ${colors.hoverActiveIconColor} !important;`);
  cssVars.push(`--white: ${colors.white} !important;`);
  cssVars.push(`--black: ${colors.black} !important;`);
  
  // Additional Colors
  cssVars.push(`--borders: ${colors.borders} !important;`);
  cssVars.push(`--border-dividers-color: ${colors.borders} !important;`);
  cssVars.push(`--borders-light: ${colors.borders} !important;`);
  cssVars.push(`--border-primary: ${colors.black} !important;`);
  cssVars.push(`--tertiary-background: ${colors.white} !important;`);
  cssVars.push(`--quaternary-background: ${colors.white} !important;`);
  cssVars.push(`--primary-tab-background: ${colors.secondaryBackground} !important;`);
  cssVars.push(`--tertiary-button-hover-bg: ${colors.tertiaryButtonHoverBg} !important;`);
  cssVars.push(`--tertiary-active-background: ${colors.tertiaryActiveBackground} !important;`);
  cssVars.push(`--secondary-active-background: ${colors.secondaryActiveBackground} !important;`);
  cssVars.push(`--secondary-background: ${colors.secondaryBackground} !important;`);
  cssVars.push(`--warning: ${colors.warning} !important;`);
  cssVars.push(`--warning-opac: ${colors.warningWithOpacity} !important;`);
  cssVars.push(`--primary-color-opacity: ${colors.primaryColorOpacity} !important;`);
  cssVars.push(`--inner-allignment-border: ${colors.innerAlignmentBorder} !important;`);
  cssVars.push(`--center-alignment: ${colors.orderStatusBar} !important;`);
  
  // Success opacity (computed if not available)
  const successOpacity = `${colors.success}26`;
  cssVars.push(`--success-opacity: ${successOpacity} !important;`);
  
  // Freebie Colors
  cssVars.push(`--freebies-background: ${colors.freebiesBg} !important;`);
  cssVars.push(`--freebie-tag-color: ${colors.freebieTag} !important;`);
  
  // Product Offer Colors
  cssVars.push(`--product-offer-bg-start: ${colors.productOfferBgStart} !important;`);
  cssVars.push(`--product-offer-bg-end: ${colors.productOfferBgEnd} !important;`);
  
  // Rating Colors
  cssVars.push(`--rating-bg-primary: ${colors.ratingColors.bgPrimaryLight} !important;`);
  cssVars.push(`--rating-bg-secondary: ${colors.ratingColors.bgSecondaryLight} !important;`);
  cssVars.push(`--rating-bg-success-primary: ${colors.ratingColors.bgSuccessPrimaryLight} !important;`);
  cssVars.push(`--rating-bg-success-opacity: ${colors.ratingColors.bgSuccessPrimaryTransparent} !important;`);
  cssVars.push(`--rating-bg-success-secondary: ${colors.ratingColors.bgSuccessSecondaryLight} !important;`);
  cssVars.push(`--rating-bg-warning-primary: ${colors.ratingColors.bgWarningPrimaryLight} !important;`);
  cssVars.push(`--rating-bg-warning-opacity: ${colors.ratingColors.bgWarningPrimaryTransparent} !important;`);
  cssVars.push(`--rating-bg-warning-secondary: ${colors.ratingColors.bgWarningSecondaryLight} !important;`);
  cssVars.push(`--rating-bg-error-primary: ${colors.ratingColors.bgErrorPrimaryLight} !important;`);
  cssVars.push(`--rating-bg-erorr-opacity: ${colors.ratingColors.bgErrorPrimaryTransparent} !important;`);
  cssVars.push(`--rating-border: ${colors.ratingColors.borderPrimaryLight} !important;`);
  cssVars.push(`--rating-border-secondary: ${colors.ratingColors.borderSecondaryLight} !important;`);
  cssVars.push(`--rating-border-primary: ${colors.bordersDividers} !important;`);
  
  // Font Family & Base Size
  cssVars.push(`--font-family: ${config.fontFamily} !important;`);
  cssVars.push(`--base-font-size: ${config.baseFontSize} !important;`);
  cssVars.push(`font-size: ${config.baseFontSize} !important;`);
  
  // Font Weights
  cssVars.push(`--font-light: ${config.fontWeights.light} !important;`);
  cssVars.push(`--font-regular: ${config.fontWeights.regular} !important;`);
  cssVars.push(`--font-medium: ${config.fontWeights.medium} !important;`);
  cssVars.push(`--font-semi-bold: ${config.fontWeights.semiBold} !important;`);
  cssVars.push(`--font-bold: ${config.fontWeights.bold} !important;`);
  cssVars.push(`--font-extra-bold: ${config.fontWeights.extraBold} !important;`);
  
  // Font Sizes
  cssVars.push(`--heading-h1: ${config.fontSizes.h1} !important;`);
  cssVars.push(`--heading-h2: ${config.fontSizes.h2} !important;`);
  cssVars.push(`--heading-h3: ${config.fontSizes.h3} !important;`);
  cssVars.push(`--heading-h4: ${config.fontSizes.h4} !important;`);
  cssVars.push(`--heading-h5: ${config.fontSizes.h5} !important;`);
  cssVars.push(`--heading-h6: ${config.fontSizes.h6} !important;`);
  cssVars.push(`--description-font: ${config.fontSizes.description} !important;`);
  cssVars.push(`--small-font: ${config.fontSizes.small} !important;`);
  cssVars.push(`--extraSmall-font: ${config.fontSizes.xss} !important;`);
  
  // Button Styles - Primary
  cssVars.push(`--button-primary-background: ${buttonStyles.primary.background} !important;`);
  cssVars.push(`--button-primary-text: ${buttonStyles.primary.text} !important;`);
  cssVars.push(`--button-primary-hover-text: ${buttonStyles.primary.hoverText} !important;`);
  cssVars.push(`--button-primary-hover-background: ${buttonStyles.primary.hoverBackground} !important;`);
  cssVars.push(`--button-primary-font-size: ${buttonStyles.primary.fontSize} !important;`);
  cssVars.push(`--button-primary-border-color: ${buttonStyles.primary.borderColor} !important;`);
  cssVars.push(`--button-primary-border-width: ${buttonStyles.primary.borderWidth} !important;`);
  cssVars.push(`--button-primary-active-background: ${colors.buttonActiveBg} !important;`);
  
  // Button Styles - Secondary
  cssVars.push(`--button-secondary-background: ${buttonStyles.secondary.background} !important;`);
  cssVars.push(`--button-secondary-text: ${buttonStyles.secondary.text} !important;`);
  cssVars.push(`--button-secondary-hover-text: ${buttonStyles.secondary.hoverText} !important;`);
  cssVars.push(`--button-secondary-hover-background: ${buttonStyles.secondary.hoverBackground} !important;`);
  cssVars.push(`--button-secondary-font-size: ${buttonStyles.secondary.fontSize} !important;`);
  cssVars.push(`--button-secondary-border-color: ${buttonStyles.secondary.borderColor} !important;`);
  cssVars.push(`--button-secondary-border-width: ${buttonStyles.secondary.borderWidth} !important;`);
  cssVars.push(`--button-secondary-active-background: ${colors.buttonActiveBg} !important;`);
  
  // Additional Button-related Variables
  cssVars.push(`--border-secondary: ${colors.buttonActiveBg} !important;`);
  
  return cssVars.join('\n');
}

/**
 * Applies CSS variables to a DOM element
 */
export function applyCssVariables(element: HTMLElement, cssString: string): void {
  const lines = cssString.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const match = line.match(/--([^:]+):\s*([^;!]+)/);
    if (match) {
      const property = `--${match[1].trim()}`;
      const value = match[2].trim();
      element.style.setProperty(property, value, 'important');
    }
  });
}

