import axiosClient from './axios';
import { THEME_CONFIG_ENDPOINT } from '@config/api.config';
import { ThemeConfig } from 'types/themeConfig.types';
import logger from '@lib/logger';
import { AxiosError } from 'axios';

/**
 * API Payload Interface matching the backend format
 * Based on the PATCH /e-commerce/v1/tenant/global-config endpoint
 */
export interface ThemeConfigApiPayload {
  fontFamily: string;
  copyright?: string;
  baseFontSize: string;
  fontSizes: {
    small: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    description: string;
    headingDescription?: string;
    headingSmall?: string;
    xss: string;
  };
  buttonStyles: {
    light: {
      primary: {
        hoverBackground: string;
        fontSize: string;
        borderColor: string;
        borderWidth: string;
        background: string;
        text: string;
        hoverText: string;
      };
      secondary: {
        fontSize: string;
        borderColor: string;
        borderWidth: string;
        background: string;
        text: string;
        hoverText: string;
        hoverBackground: string;
      };
    };
    dark: {
      primary: {
        background: string;
        text: string;
        hoverText: string;
        hoverBackground: string;
        fontSize: string;
        borderColor: string;
        borderWidth: string;
      };
      secondary: {
        background: string;
        text: string;
        hoverText: string;
        hoverBackground: string;
        fontSize: string;
        borderColor: string;
        borderWidth: string;
      };
    };
  };
  themeColors: {
    dark: {
      secondaryText: string;
      ctaHover: string;
      success: string;
      error: string;
      accentColor: string;
      bordersDividers: string;
      black: string;
      warning: string;
      cardsContainers: string;
      primaryIconColor: string;
      white: string;
      primaryText: string;
      primaryColor: string;
      hoverActiveIconColor: string;
      primaryBackground: string;
      orderStatusbar: string;
      secondaryActiveBackground: string;
      tertiaryActiveBackground: string;
      tertiaryButtonHoverbg: string;
      warningWithOpacity: string;
      ratingColors: {
        borderSecondaryDark: string;
      };
      borders: string;
      buttonActiveBg: string;
      secondaryBackground: string;
      freebieTag: string;
      freebiesBg: string;
      productOfferBgEnd: string;
      productOfferBgStart: string;
      innerAlignmentBorder: string;
    };
    light: {
      secondaryText: string;
      primaryColor: string;
      ctaHover: string;
      success: string;
      cardsContainers: string;
      hoverActiveIconColor: string;
      white: string;
      black: string;
      accentColor: string;
      error: string;
      primaryText: string;
      warning: string;
      primaryBackground: string;
      bordersDividers: string;
      primaryIconColor: string;
      orderStatusbar: string;
      secondaryActiveBackground: string;
      tertiaryActiveBackground: string;
      tertiaryButtonHoverbg: string;
      warningWithOpacity: string;
      ratingColors: {
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
      };
      borders: string;
      buttonActiveBg: string;
      primaryColorOpacity: string;
      secondaryBackground: string;
      freebieTag: string;
      freebiesBg: string;
      productOfferBgEnd: string;
      productOfferBgStart: string;
      innerAlignmentBorder: string;
    };
  };
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semiBold: number;
    bold: number;
    extraBold: number;
  };
}

/**
 * Converts ThemeConfig to API payload format
 * @param config - The theme configuration object
 * @returns API payload matching backend expectations
 */
export const convertToApiPayload = (config: ThemeConfig): ThemeConfigApiPayload => {
  return {
    fontFamily: config.fontFamily,
    baseFontSize: config.baseFontSize,
    fontSizes: {
      small: config.fontSizes.small,
      h1: config.fontSizes.h1,
      h2: config.fontSizes.h2,
      h3: config.fontSizes.h3,
      h4: config.fontSizes.h4,
      h5: config.fontSizes.h5,
      h6: config.fontSizes.h6,
      description: config.fontSizes.description,
      xss: config.fontSizes.xss,
    },
    buttonStyles: {
      light: {
        primary: {
          hoverBackground: config.buttonStyles.light.primary.hoverBackground,
          fontSize: config.buttonStyles.light.primary.fontSize,
          borderColor: config.buttonStyles.light.primary.borderColor,
          borderWidth: config.buttonStyles.light.primary.borderWidth,
          background: config.buttonStyles.light.primary.background,
          text: config.buttonStyles.light.primary.text,
          hoverText: config.buttonStyles.light.primary.hoverText,
        },
        secondary: {
          fontSize: config.buttonStyles.light.secondary.fontSize,
          borderColor: config.buttonStyles.light.secondary.borderColor,
          borderWidth: config.buttonStyles.light.secondary.borderWidth,
          background: config.buttonStyles.light.secondary.background,
          text: config.buttonStyles.light.secondary.text,
          hoverText: config.buttonStyles.light.secondary.hoverText,
          hoverBackground: config.buttonStyles.light.secondary.hoverBackground,
        },
      },
      dark: {
        primary: {
          background: config.buttonStyles.dark.primary.background,
          text: config.buttonStyles.dark.primary.text,
          hoverText: config.buttonStyles.dark.primary.hoverText,
          hoverBackground: config.buttonStyles.dark.primary.hoverBackground,
          fontSize: config.buttonStyles.dark.primary.fontSize,
          borderColor: config.buttonStyles.dark.primary.borderColor,
          borderWidth: config.buttonStyles.dark.primary.borderWidth,
        },
        secondary: {
          background: config.buttonStyles.dark.secondary.background,
          text: config.buttonStyles.dark.secondary.text,
          hoverText: config.buttonStyles.dark.secondary.hoverText,
          hoverBackground: config.buttonStyles.dark.secondary.hoverBackground,
          fontSize: config.buttonStyles.dark.secondary.fontSize,
          borderColor: config.buttonStyles.dark.secondary.borderColor,
          borderWidth: config.buttonStyles.dark.secondary.borderWidth,
        },
      },
    },
    themeColors: {
      dark: {
        secondaryText: config.themeColors.dark.secondaryText,
        ctaHover: config.themeColors.dark.ctaHover,
        success: config.themeColors.dark.success,
        error: config.themeColors.dark.error,
        accentColor: config.themeColors.dark.accentColor,
        bordersDividers: config.themeColors.dark.bordersDividers,
        black: config.themeColors.dark.black,
        warning: config.themeColors.dark.warning,
        cardsContainers: config.themeColors.dark.cardsContainers,
        primaryIconColor: config.themeColors.dark.primaryIconColor,
        white: config.themeColors.dark.white,
        primaryText: config.themeColors.dark.primaryText,
        primaryColor: config.themeColors.dark.primaryColor,
        hoverActiveIconColor: config.themeColors.dark.hoverActiveIconColor,
        primaryBackground: config.themeColors.dark.primaryBackground,
        orderStatusbar: config.themeColors.dark.orderStatusBar,
        secondaryActiveBackground: config.themeColors.dark.secondaryActiveBackground,
        tertiaryActiveBackground: config.themeColors.dark.tertiaryActiveBackground,
        tertiaryButtonHoverbg: config.themeColors.dark.tertiaryButtonHoverBg,
        warningWithOpacity: config.themeColors.dark.warningWithOpacity,
        ratingColors: {
          borderSecondaryDark: config.themeColors.dark.ratingColors.borderSecondaryDark,
        },
        borders: config.themeColors.dark.borders,
        buttonActiveBg: config.themeColors.dark.buttonActiveBg,
        secondaryBackground: config.themeColors.dark.secondaryBackground,
        freebieTag: config.themeColors.dark.freebieTag,
        freebiesBg: config.themeColors.dark.freebiesBg,
        productOfferBgEnd: config.themeColors.dark.productOfferBgEnd,
        productOfferBgStart: config.themeColors.dark.productOfferBgStart,
        innerAlignmentBorder: config.themeColors.dark.innerAlignmentBorder,
      },
      light: {
        secondaryText: config.themeColors.light.secondaryText,
        primaryColor: config.themeColors.light.primaryColor,
        ctaHover: config.themeColors.light.ctaHover,
        success: config.themeColors.light.success,
        cardsContainers: config.themeColors.light.cardsContainers,
        hoverActiveIconColor: config.themeColors.light.hoverActiveIconColor,
        white: config.themeColors.light.white,
        black: config.themeColors.light.black,
        accentColor: config.themeColors.light.accentColor,
        error: config.themeColors.light.error,
        primaryText: config.themeColors.light.primaryText,
        warning: config.themeColors.light.warning,
        primaryBackground: config.themeColors.light.primaryBackground,
        bordersDividers: config.themeColors.light.bordersDividers,
        primaryIconColor: config.themeColors.light.primaryIconColor,
        orderStatusbar: config.themeColors.light.orderStatusBar,
        secondaryActiveBackground: config.themeColors.light.secondaryActiveBackground,
        tertiaryActiveBackground: config.themeColors.light.tertiaryActiveBackground,
        tertiaryButtonHoverbg: config.themeColors.light.tertiaryButtonHoverBg,
        warningWithOpacity: config.themeColors.light.warningWithOpacity,
        ratingColors: {
          bgPrimaryLight: config.themeColors.light.ratingColors.bgPrimaryLight,
          bgSecondaryLight: config.themeColors.light.ratingColors.bgSecondaryLight,
          bgSuccessPrimaryLight: config.themeColors.light.ratingColors.bgSuccessPrimaryLight,
          bgSuccessPrimaryTransparent: config.themeColors.light.ratingColors.bgSuccessPrimaryTransparent,
          bgSuccessSecondaryLight: config.themeColors.light.ratingColors.bgSuccessSecondaryLight,
          bgWarningPrimaryLight: config.themeColors.light.ratingColors.bgWarningPrimaryLight,
          bgWarningPrimaryTransparent: config.themeColors.light.ratingColors.bgWarningPrimaryTransparent,
          bgWarningSecondaryLight: config.themeColors.light.ratingColors.bgWarningSecondaryLight,
          bgErrorPrimaryLight: config.themeColors.light.ratingColors.bgErrorPrimaryLight,
          bgErrorPrimaryTransparent: config.themeColors.light.ratingColors.bgErrorPrimaryTransparent,
          borderPrimaryLight: config.themeColors.light.ratingColors.borderPrimaryLight,
          borderSecondaryLight: config.themeColors.light.ratingColors.borderSecondaryLight,
        },
        borders: config.themeColors.light.borders,
        buttonActiveBg: config.themeColors.light.buttonActiveBg,
        primaryColorOpacity: config.themeColors.light.primaryColorOpacity,
        secondaryBackground: config.themeColors.light.secondaryBackground,
        freebieTag: config.themeColors.light.freebieTag,
        freebiesBg: config.themeColors.light.freebiesBg,
        productOfferBgEnd: config.themeColors.light.productOfferBgEnd,
        productOfferBgStart: config.themeColors.light.productOfferBgStart,
        innerAlignmentBorder: config.themeColors.light.innerAlignmentBorder,
      },
    },
    fontWeights: {
      light: parseInt(config.fontWeights.light),
      regular: parseInt(config.fontWeights.regular),
      medium: parseInt(config.fontWeights.medium),
      semiBold: parseInt(config.fontWeights.semiBold),
      bold: parseInt(config.fontWeights.bold),
      extraBold: parseInt(config.fontWeights.extraBold),
    },
  };
};

/**
 * API Response Interface
 */
export interface ThemeConfigApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

/**
 * Saves theme configuration to the backend API
 * @param config - The theme configuration object
 * @param token - Optional authentication token from query params
 * @returns Promise with API response
 */
export const saveThemeConfig = async (config: ThemeConfig, token?: string | null): Promise<ThemeConfigApiResponse> => {
  try {
    const payload = convertToApiPayload(config);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestConfig = {
      headers: headers
    };
    
    const response = await axiosClient.patch(THEME_CONFIG_ENDPOINT, payload, requestConfig);
    
    return {
      success: true,
      message: 'Theme configuration saved successfully',
      data: response.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error occurred',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fetches theme configuration from the backend API
 * @returns Promise with theme configuration
 */
export const fetchThemeConfig = async (): Promise<ThemeConfigApiResponse> => {
  try {
    logger.info('🎨 Fetching theme configuration from API...');
    
    const response = await axiosClient.get(THEME_CONFIG_ENDPOINT);

    logger.info('✅ Theme configuration fetched successfully');
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logger.error('❌ Error fetching theme configuration:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

