import { ThemeConfig } from "types/themeConfig.types";

/**
 * ENV File Generator
 * Generates .env format file from theme configuration
 * All font sizes are in px format (not rem)
 */

/**
 * Generates complete .env file content from theme configuration
 */
export function generateEnvFile(config: ThemeConfig): string {
  const lines: string[] = [];
  
  // Header
  lines.push("# ==============================================");
  lines.push("# THEME CONFIGURATION - GENERATED FILE");
  lines.push("# ==============================================");
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push("# Copy this file content to .env.local and restart your dev server");
  lines.push("#");
  lines.push("");
  
  // Brand Colors - Light Mode
  lines.push("# ==============================================");
  lines.push("# Brand Colors - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_COLOR_LIGHT=${config.themeColors.light.primaryColor}`);
  lines.push(`NEXT_PUBLIC_CTA_HOVER_LIGHT=${config.themeColors.light.ctaHover}`);
  lines.push(`NEXT_PUBLIC_ACCENT_COLOR_LIGHT=${config.themeColors.light.accentColor}`);
  lines.push("");
  
  // Brand Colors - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Brand Colors - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_COLOR_DARK=${config.themeColors.dark.primaryColor}`);
  lines.push(`NEXT_PUBLIC_CTA_HOVER_DARK=${config.themeColors.dark.ctaHover}`);
  lines.push(`NEXT_PUBLIC_ACCENT_COLOR_DARK=${config.themeColors.dark.accentColor}`);
  lines.push("");
  
  // Backgrounds - Light Mode
  lines.push("# ==============================================");
  lines.push("# Background Colors - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_BACKGROUND_LIGHT=${config.themeColors.light.primaryBackground}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_BACKGROUND_LIGHT=${config.themeColors.light.secondaryBackground}`);
  lines.push(`NEXT_PUBLIC_CARDS_CONTAINERS_LIGHT=${config.themeColors.light.cardsContainers}`);
  lines.push(`NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_LIGHT=${config.themeColors.light.tertiaryActiveBackground}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_LIGHT=${config.themeColors.light.secondaryActiveBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_ACTIVE_BG_LIGHT=${config.themeColors.light.buttonActiveBg}`);
  lines.push(`NEXT_PUBLIC_ORDER_STATUS_BAR_LIGHT=${config.themeColors.light.orderStatusBar}`);
  lines.push("");
  
  // Backgrounds - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Background Colors - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_BACKGROUND_DARK=${config.themeColors.dark.primaryBackground}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_BACKGROUND_DARK=${config.themeColors.dark.secondaryBackground}`);
  lines.push(`NEXT_PUBLIC_CARDS_CONTAINERS_DARK=${config.themeColors.dark.cardsContainers}`);
  lines.push(`NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_DARK=${config.themeColors.dark.tertiaryActiveBackground}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_DARK=${config.themeColors.dark.secondaryActiveBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_ACTIVE_BG_DARK=${config.themeColors.dark.buttonActiveBg}`);
  lines.push(`NEXT_PUBLIC_ORDER_STATUS_BAR_DARK=${config.themeColors.dark.orderStatusBar}`);
  lines.push("");
  
  // Text Colors - Light Mode
  lines.push("# ==============================================");
  lines.push("# Text Colors - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_TEXT_LIGHT=${config.themeColors.light.primaryText}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_TEXT_LIGHT=${config.themeColors.light.secondaryText}`);
  lines.push("");
  
  // Text Colors - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Text Colors - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_TEXT_DARK=${config.themeColors.dark.primaryText}`);
  lines.push(`NEXT_PUBLIC_SECONDARY_TEXT_DARK=${config.themeColors.dark.secondaryText}`);
  lines.push("");
  
  // State Colors - Light Mode
  lines.push("# ==============================================");
  lines.push("# State Colors - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_SUCCESS_LIGHT=${config.themeColors.light.success}`);
  lines.push(`NEXT_PUBLIC_WARNING_LIGHT=${config.themeColors.light.warning}`);
  lines.push(`NEXT_PUBLIC_WARNING_WITH_OPACITY_LIGHT=${config.themeColors.light.warningWithOpacity}`);
  lines.push(`NEXT_PUBLIC_ERROR_LIGHT=${config.themeColors.light.error}`);
  lines.push("");
  
  // State Colors - Dark Mode
  lines.push("# ==============================================");
  lines.push("# State Colors - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_SUCCESS_DARK=${config.themeColors.dark.success}`);
  lines.push(`NEXT_PUBLIC_WARNING_DARK=${config.themeColors.dark.warning}`);
  lines.push(`NEXT_PUBLIC_WARNING_WITH_OPACITY_DARK=${config.themeColors.dark.warningWithOpacity}`);
  lines.push(`NEXT_PUBLIC_ERROR_DARK=${config.themeColors.dark.error}`);
  lines.push("");
  
  // Borders & Dividers - Light Mode
  lines.push("# ==============================================");
  lines.push("# Borders & Dividers - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT=${config.themeColors.light.bordersDividers}`);
  lines.push(`NEXT_PUBLIC_BORDERS_LIGHT=${config.themeColors.light.borders}`);
  lines.push(`NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_LIGHT=${config.themeColors.light.innerAlignmentBorder}`);
  lines.push(`NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_LIGHT=${config.themeColors.light.tertiaryButtonHoverBg}`);
  lines.push("");
  
  // Borders & Dividers - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Borders & Dividers - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BORDERS_DIVIDERS_DARK=${config.themeColors.dark.bordersDividers}`);
  lines.push(`NEXT_PUBLIC_BORDERS_DARK=${config.themeColors.dark.borders}`);
  lines.push(`NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_DARK=${config.themeColors.dark.innerAlignmentBorder}`);
  lines.push(`NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_DARK=${config.themeColors.dark.tertiaryButtonHoverBg}`);
  lines.push("");
  
  // Icon Colors - Light Mode
  lines.push("# ==============================================");
  lines.push("# Icon Colors - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_ICON_COLOR_LIGHT=${config.themeColors.light.primaryIconColor}`);
  lines.push(`NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_LIGHT=${config.themeColors.light.hoverActiveIconColor}`);
  lines.push("");
  
  // Icon Colors - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Icon Colors - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_ICON_COLOR_DARK=${config.themeColors.dark.primaryIconColor}`);
  lines.push(`NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_DARK=${config.themeColors.dark.hoverActiveIconColor}`);
  lines.push("");
  
  // Special Values - Light Mode
  lines.push("# ==============================================");
  lines.push("# Special Values - Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_WHITE_LIGHT=${config.themeColors.light.white}`);
  lines.push(`NEXT_PUBLIC_BLACK_LIGHT=${config.themeColors.light.black}`);
  lines.push("");
  
  // Special Values - Dark Mode
  lines.push("# ==============================================");
  lines.push("# Special Values - Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_WHITE_DARK=${config.themeColors.dark.white}`);
  lines.push(`NEXT_PUBLIC_BLACK_DARK=${config.themeColors.dark.black}`);
  lines.push("");
  
  // Opacity Colors
  lines.push("# ==============================================");
  lines.push("# Opacity Colors (shared between modes)");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_PRIMARY_COLOR_OPACITY=${config.themeColors.light.primaryColorOpacity}`);
  lines.push("");
  
  // Rating Colors - Light Mode
  lines.push("# ==============================================");
  lines.push("# Rating Colors");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT=${config.themeColors.light.ratingColors.bgPrimaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT=${config.themeColors.light.ratingColors.bgSecondaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT=${config.themeColors.light.ratingColors.bgSuccessPrimaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT=${config.themeColors.light.ratingColors.bgSuccessPrimaryTransparent}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT=${config.themeColors.light.ratingColors.bgSuccessSecondaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT=${config.themeColors.light.ratingColors.bgWarningPrimaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT=${config.themeColors.light.ratingColors.bgWarningPrimaryTransparent}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT=${config.themeColors.light.ratingColors.bgWarningSecondaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT=${config.themeColors.light.ratingColors.bgErrorPrimaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT=${config.themeColors.light.ratingColors.bgErrorPrimaryTransparent}`);
  lines.push(`NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT=${config.themeColors.light.ratingColors.borderPrimaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BORDER_SECONDARY_LIGHT=${config.themeColors.light.ratingColors.borderSecondaryLight}`);
  lines.push(`NEXT_PUBLIC_RATING_BORDER_SECONDARY_DARK=${config.themeColors.light.ratingColors.borderSecondaryDark}`);
  lines.push("");
  
  // Typography
  lines.push("# ==============================================");
  lines.push("# Typography - Font Family & Base Size");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_FONT_FAMILY=${config.fontFamily}`);
  lines.push(`NEXT_PUBLIC_BASE_FONT_SIZE=${config.baseFontSize}`);
  lines.push("");
  
  // Font Weights
  lines.push("# ==============================================");
  lines.push("# Typography - Font Weights");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_FONT_LIGHT=${config.fontWeights.light}`);
  lines.push(`NEXT_PUBLIC_FONT_REGULAR=${config.fontWeights.regular}`);
  lines.push(`NEXT_PUBLIC_FONT_MEDIUM=${config.fontWeights.medium}`);
  lines.push(`NEXT_PUBLIC_FONT_SEMI_BOLD=${config.fontWeights.semiBold}`);
  lines.push(`NEXT_PUBLIC_FONT_BOLD=${config.fontWeights.bold}`);
  lines.push(`NEXT_PUBLIC_FONT_EXTRA_BOLD=${config.fontWeights.extraBold}`);
  lines.push("");
  
  // Font Sizes - ALL IN PX FORMAT
  lines.push("# ==============================================");
  lines.push("# Typography - Font Sizes (in px format)");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_EXTRA_SMALL_FONT=${config.fontSizes.xss}`);
  lines.push(`NEXT_PUBLIC_SMALL_FONT=${config.fontSizes.small}`);
  lines.push(`NEXT_PUBLIC_DESCRIPTION_FONT=${config.fontSizes.description}`);
  lines.push(`NEXT_PUBLIC_HEADING_H1=${config.fontSizes.h1}`);
  lines.push(`NEXT_PUBLIC_HEADING_H2=${config.fontSizes.h2}`);
  lines.push(`NEXT_PUBLIC_HEADING_H3=${config.fontSizes.h3}`);
  lines.push(`NEXT_PUBLIC_HEADING_H4=${config.fontSizes.h4}`);
  lines.push(`NEXT_PUBLIC_HEADING_H5=${config.fontSizes.h5}`);
  lines.push(`NEXT_PUBLIC_HEADING_H6=${config.fontSizes.h6}`);
  lines.push(`NEXT_PUBLIC_HEADING_SMALL=${config.fontSizes.small}`);
  lines.push(`NEXT_PUBLIC_HEADING_DESCRIPTION=${config.fontSizes.description}`);
  lines.push("");
  
  // Button Styles - Primary Light
  lines.push("# ==============================================");
  lines.push("# Button Styles - Primary Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BG_LIGHT=${config.buttonStyles.light.primary.background}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_LIGHT=${config.buttonStyles.light.primary.text}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_LIGHT=${config.buttonStyles.light.primary.hoverText}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_LIGHT=${config.buttonStyles.light.primary.hoverBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_LIGHT=${config.buttonStyles.light.primary.borderColor}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_LIGHT=${config.buttonStyles.light.primary.borderWidth}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_LIGHT=${config.buttonStyles.light.primary.fontSize}`);
  lines.push("");
  
  // Button Styles - Primary Dark
  lines.push("# ==============================================");
  lines.push("# Button Styles - Primary Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BG_DARK=${config.buttonStyles.dark.primary.background}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_DARK=${config.buttonStyles.dark.primary.text}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_DARK=${config.buttonStyles.dark.primary.hoverText}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_DARK=${config.buttonStyles.dark.primary.hoverBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_DARK=${config.buttonStyles.dark.primary.borderColor}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_DARK=${config.buttonStyles.dark.primary.borderWidth}`);
  lines.push(`NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_DARK=${config.buttonStyles.dark.primary.fontSize}`);
  lines.push("");
  
  // Button Styles - Secondary Light
  lines.push("# ==============================================");
  lines.push("# Button Styles - Secondary Light Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BG_LIGHT=${config.buttonStyles.light.secondary.background}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_LIGHT=${config.buttonStyles.light.secondary.text}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_LIGHT=${config.buttonStyles.light.secondary.hoverText}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_LIGHT=${config.buttonStyles.light.secondary.hoverBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_LIGHT=${config.buttonStyles.light.secondary.borderColor}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_LIGHT=${config.buttonStyles.light.secondary.borderWidth}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_LIGHT=${config.buttonStyles.light.secondary.fontSize}`);
  lines.push("");
  
  // Button Styles - Secondary Dark
  lines.push("# ==============================================");
  lines.push("# Button Styles - Secondary Dark Mode");
  lines.push("# ==============================================");
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BG_DARK=${config.buttonStyles.dark.secondary.background}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_DARK=${config.buttonStyles.dark.secondary.text}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_DARK=${config.buttonStyles.dark.secondary.hoverText}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_DARK=${config.buttonStyles.dark.secondary.hoverBackground}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_DARK=${config.buttonStyles.dark.secondary.borderColor}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_DARK=${config.buttonStyles.dark.secondary.borderWidth}`);
  lines.push(`NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_DARK=${config.buttonStyles.dark.secondary.fontSize}`);
  lines.push("");
  
  lines.push("# ==============================================");
  lines.push("# END OF THEME CONFIGURATION");
  lines.push("# ==============================================");
  
  return lines.join('\n');
}

/**
 * Triggers browser download of .env file
 */
export function downloadEnvFile(content: string, filename: string = '.env.theme'): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Loads theme configuration from current ENV variables
 * Converts rem to px (16px base) if found
 */
export function loadConfigFromEnv(): Partial<ThemeConfig> {
  const remToPx = (remValue: string): string => {
    const match = remValue.match(/^([\d.]+)rem$/);
    if (match) {
      const rem = parseFloat(match[1]);
      return `${Math.round(rem * 16)}px`;
    }
    return remValue;
  };
  
  const getEnv = (key: string, defaultValue: string = ''): string => {
    const value = process.env[key] || defaultValue;
    // Convert rem to px if needed
    return value.includes('rem') ? remToPx(value) : value;
  };
  
  return {
    themeColors: {
      light: {
        primaryBackground: getEnv('NEXT_PUBLIC_PRIMARY_BACKGROUND_LIGHT', '#FFFFFF'),
        primaryText: getEnv('NEXT_PUBLIC_PRIMARY_TEXT_LIGHT', '#1A1A1A'),
        secondaryText: getEnv('NEXT_PUBLIC_SECONDARY_TEXT_LIGHT', '#666666'),
        primaryColor: getEnv('NEXT_PUBLIC_PRIMARY_COLOR_LIGHT', '#6366F1'),
        ctaHover: getEnv('NEXT_PUBLIC_CTA_HOVER_LIGHT', '#4F46E5'),
        accentColor: getEnv('NEXT_PUBLIC_ACCENT_COLOR_LIGHT', '#EC4899'),
        success: getEnv('NEXT_PUBLIC_SUCCESS_LIGHT', '#10B981'),
        warning: getEnv('NEXT_PUBLIC_WARNING_LIGHT', '#F59E0B'),
        error: getEnv('NEXT_PUBLIC_ERROR_LIGHT', '#EF4444'),
        bordersDividers: getEnv('NEXT_PUBLIC_BORDERS_DIVIDERS_LIGHT', '#E5E5E5'),
        cardsContainers: getEnv('NEXT_PUBLIC_CARDS_CONTAINERS_LIGHT', '#F5F5F5'),
        primaryIconColor: getEnv('NEXT_PUBLIC_PRIMARY_ICON_COLOR_LIGHT', '#1A1A1A'),
        hoverActiveIconColor: getEnv('NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_LIGHT', '#6366F1'),
        white: getEnv('NEXT_PUBLIC_WHITE_LIGHT', '#FFFFFF'),
        black: getEnv('NEXT_PUBLIC_BLACK_LIGHT', '#000000'),
        borders: getEnv('NEXT_PUBLIC_BORDERS_LIGHT', '#E5E5E5'),
        tertiaryButtonHoverBg: getEnv('NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_LIGHT', '#F5F5F5'),
        tertiaryActiveBackground: getEnv('NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_LIGHT', '#6366F10D'),
        secondaryActiveBackground: getEnv('NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_LIGHT', '#6366F11A'),
        secondaryBackground: getEnv('NEXT_PUBLIC_SECONDARY_BACKGROUND_LIGHT', '#F9FAFB'),
        buttonActiveBg: getEnv('NEXT_PUBLIC_BUTTON_ACTIVE_BG_LIGHT', '#6366F133'),
        warningWithOpacity: getEnv('NEXT_PUBLIC_WARNING_WITH_OPACITY_LIGHT', '#F59E0B21'),
        primaryColorOpacity: getEnv('NEXT_PUBLIC_PRIMARY_COLOR_OPACITY', '#6366F166'),
        innerAlignmentBorder: getEnv('NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_LIGHT', '#E0E0E0'),
        orderStatusBar: getEnv('NEXT_PUBLIC_ORDER_STATUS_BAR_LIGHT', '#FEF3C7'),
        freebiesBg: getEnv('NEXT_PUBLIC_FREEBIES_BG_LIGHT', '#E1F0D9'),
        freebieTag: getEnv('NEXT_PUBLIC_FREEBIE_TAG_LIGHT', '#66BB6A'),
        productOfferBgStart: getEnv('NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_START', '#E6FFE7'),
        productOfferBgEnd: getEnv('NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_END', '#FFFFFF'),
        ratingColors: {
          bgPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT', '#FFC107'),
          bgSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT', '#E0E0E0'),
          bgSuccessPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT', '#10B981'),
          bgSuccessPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT', '#10B9811A'),
          bgSuccessSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT', '#34D399'),
          bgWarningPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT', '#F59E0B'),
          bgWarningPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT', '#F59E0B1A'),
          bgWarningSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT', '#FBBF24'),
          bgErrorPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT', '#EF4444'),
          bgErrorPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT', '#EF44441A'),
          borderPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT', '#F59E0B'),
          borderSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BORDER_SECONDARY_LIGHT', '#9E9E9E'),
          borderSecondaryDark: getEnv('NEXT_PUBLIC_RATING_BORDER_SECONDARY_DARK', 'transparent'),
        }
      },
      dark: {
        primaryBackground: getEnv('NEXT_PUBLIC_PRIMARY_BACKGROUND_DARK', '#0F172A'),
        primaryText: getEnv('NEXT_PUBLIC_PRIMARY_TEXT_DARK', '#F1F5F9'),
        secondaryText: getEnv('NEXT_PUBLIC_SECONDARY_TEXT_DARK', '#94A3B8'),
        primaryColor: getEnv('NEXT_PUBLIC_PRIMARY_COLOR_DARK', '#818CF8'),
        ctaHover: getEnv('NEXT_PUBLIC_CTA_HOVER_DARK', '#6366F1'),
        accentColor: getEnv('NEXT_PUBLIC_ACCENT_COLOR_DARK', '#F472B6'),
        success: getEnv('NEXT_PUBLIC_SUCCESS_DARK', '#34D399'),
        warning: getEnv('NEXT_PUBLIC_WARNING_DARK', '#FBBF24'),
        error: getEnv('NEXT_PUBLIC_ERROR_DARK', '#F87171'),
        bordersDividers: getEnv('NEXT_PUBLIC_BORDERS_DIVIDERS_DARK', '#334155'),
        cardsContainers: getEnv('NEXT_PUBLIC_CARDS_CONTAINERS_DARK', '#1E293B'),
        primaryIconColor: getEnv('NEXT_PUBLIC_PRIMARY_ICON_COLOR_DARK', '#F1F5F9'),
        hoverActiveIconColor: getEnv('NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_DARK', '#818CF8'),
        white: getEnv('NEXT_PUBLIC_WHITE_DARK', '#F1F5F9'),
        black: getEnv('NEXT_PUBLIC_BLACK_DARK', '#0F172A'),
        borders: getEnv('NEXT_PUBLIC_BORDERS_DARK', '#334155'),
        tertiaryButtonHoverBg: getEnv('NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_DARK', '#1E293B'),
        tertiaryActiveBackground: getEnv('NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_DARK', '#818CF80D'),
        secondaryActiveBackground: getEnv('NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_DARK', '#818CF81A'),
        secondaryBackground: getEnv('NEXT_PUBLIC_SECONDARY_BACKGROUND_DARK', '#1E293B'),
        buttonActiveBg: getEnv('NEXT_PUBLIC_BUTTON_ACTIVE_BG_DARK', '#818CF833'),
        warningWithOpacity: getEnv('NEXT_PUBLIC_WARNING_WITH_OPACITY_DARK', '#FBBF2421'),
        primaryColorOpacity: getEnv('NEXT_PUBLIC_PRIMARY_COLOR_OPACITY', '#818CF866'),
        innerAlignmentBorder: getEnv('NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_DARK', '#475569'),
        orderStatusBar: getEnv('NEXT_PUBLIC_ORDER_STATUS_BAR_DARK', '#422006'),
        freebiesBg: getEnv('NEXT_PUBLIC_FREEBIES_BG_DARK', '#0F2A01'),
        freebieTag: getEnv('NEXT_PUBLIC_FREEBIE_TAG_DARK', '#66BB6A'),
        productOfferBgStart: getEnv('NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_START', '#003402'),
        productOfferBgEnd: getEnv('NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_END', '#212121'),
        ratingColors: {
          bgPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT', '#FFC107'),
          bgSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT', '#475569'),
          bgSuccessPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT', '#10B981'),
          bgSuccessPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT', '#10B9811A'),
          bgSuccessSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT', '#34D399'),
          bgWarningPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT', '#F59E0B'),
          bgWarningPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT', '#F59E0B1A'),
          bgWarningSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT', '#FBBF24'),
          bgErrorPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT', '#EF4444'),
          bgErrorPrimaryTransparent: getEnv('NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT', '#EF44441A'),
          borderPrimaryLight: getEnv('NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT', '#F59E0B'),
          borderSecondaryLight: getEnv('NEXT_PUBLIC_RATING_BORDER_SECONDARY_LIGHT', '#64748B'),
          borderSecondaryDark: getEnv('NEXT_PUBLIC_RATING_BORDER_SECONDARY_DARK', 'transparent'),
        }
      }
    },
    fontFamily: getEnv('NEXT_PUBLIC_FONT_FAMILY', 'Inter, sans-serif'),
    baseFontSize: getEnv('NEXT_PUBLIC_BASE_FONT_SIZE', '16px'),
    fontWeights: {
      light: getEnv('NEXT_PUBLIC_FONT_LIGHT', '300'),
      regular: getEnv('NEXT_PUBLIC_FONT_REGULAR', '400'),
      medium: getEnv('NEXT_PUBLIC_FONT_MEDIUM', '500'),
      semiBold: getEnv('NEXT_PUBLIC_FONT_SEMI_BOLD', '600'),
      bold: getEnv('NEXT_PUBLIC_FONT_BOLD', '700'),
      extraBold: getEnv('NEXT_PUBLIC_FONT_EXTRA_BOLD', '800'),
    },
    fontSizes: {
      xss: getEnv('NEXT_PUBLIC_EXTRA_SMALL_FONT', '12px'),
      small: getEnv('NEXT_PUBLIC_SMALL_FONT', '14px'),
      description: getEnv('NEXT_PUBLIC_DESCRIPTION_FONT', '16px'),
      h1: getEnv('NEXT_PUBLIC_HEADING_H1', '40px'),
      h2: getEnv('NEXT_PUBLIC_HEADING_H2', '27px'),
      h3: getEnv('NEXT_PUBLIC_HEADING_H3', '21px'),
      h4: getEnv('NEXT_PUBLIC_HEADING_H4', '18px'),
      h5: getEnv('NEXT_PUBLIC_HEADING_H5', '16px'),
      h6: getEnv('NEXT_PUBLIC_HEADING_H6', '14px'),
    },
    buttonStyles: {
      light: {
        primary: {
          background: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BG_LIGHT', '#6366F1'),
          text: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_LIGHT', '#FFFFFF'),
          hoverBackground: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_LIGHT', '#4F46E5'),
          hoverText: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_LIGHT', '#FFFFFF'),
          borderColor: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_LIGHT', '#6366F1'),
          borderWidth: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_LIGHT', '0px'),
          fontSize: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_LIGHT', '16px'),
        },
        secondary: {
          background: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BG_LIGHT', '#F1F5F9'),
          text: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_LIGHT', '#475569'),
          hoverBackground: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_LIGHT', '#E2E8F0'),
          hoverText: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_LIGHT', '#334155'),
          borderColor: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_LIGHT', '#CBD5E1'),
          borderWidth: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_LIGHT', '1px'),
          fontSize: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_LIGHT', '16px'),
        }
      },
      dark: {
        primary: {
          background: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BG_DARK', '#818CF8'),
          text: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_TEXT_DARK', '#0F172A'),
          hoverBackground: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_BG_DARK', '#6366F1'),
          hoverText: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_HOVER_TEXT_DARK', '#FFFFFF'),
          borderColor: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_COLOR_DARK', '#818CF8'),
          borderWidth: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_BORDER_WIDTH_DARK', '0px'),
          fontSize: getEnv('NEXT_PUBLIC_BUTTON_PRIMARY_FONT_SIZE_DARK', '16px'),
        },
        secondary: {
          background: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BG_DARK', '#334155'),
          text: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_TEXT_DARK', '#F1F5F9'),
          hoverBackground: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_BG_DARK', '#475569'),
          hoverText: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_HOVER_TEXT_DARK', '#FFFFFF'),
          borderColor: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_COLOR_DARK', '#475569'),
          borderWidth: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_BORDER_WIDTH_DARK', '1px'),
          fontSize: getEnv('NEXT_PUBLIC_BUTTON_SECONDARY_FONT_SIZE_DARK', '16px'),
        }
      }
    }
  };
}

