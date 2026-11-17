import { ThemeConfig } from "types/themeConfig.types";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}

/**
 * Spicy Tomato Theme - Energetic red and orange palette
 * Perfect for fast food, pizza, and quick delivery services
 * Colors evoke appetite, urgency, and excitement
 */
const SPICY_TOMATO_THEME: ThemeConfig = {
  themeColors: {
    light: {
      // Core Theme Colors - Warm and appetizing
      primaryBackground: '#FFF8F5', // Warm cream background
      primaryText: '#2D1810', // Dark brown text for readability
      secondaryText: '#8B4513', // Medium brown for secondary text
      primaryColor: '#FF6347', // Tomato red - main brand color
      ctaHover: '#FF4500', // Orange red for hover states
      accentColor: '#FFA500', // Bright orange accent
      success: '#32CD32', // Fresh green for success
      warning: '#FFD700', // Golden yellow for warnings
      error: '#DC143C', // Deep red for errors
      bordersDividers: '#F4A460', // Sandy brown borders
      cardsContainers: '#FFFFFF', // Clean white cards
      primaryIconColor: '#8B4513', // Brown icons
      hoverActiveIconColor: '#FF6347', // Tomato red for active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#D2691E', // Chocolate brown borders
      tertiaryButtonHoverBg: '#FFE4E1', // Misty rose hover
      secondaryBackground: '#FFF5EE', // Seashell background
      innerAlignmentBorder: '#FF7F50', // Coral border
      orderStatusBar: '#FFEFD5', // Papaya whip status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#FF634733', // Tomato with opacity
      secondaryActiveBackground: '#FF63471A', // Tomato with light opacity
      buttonActiveBg: '#FF634766', // Tomato active background
      warningWithOpacity: '#FFD70021', // Golden yellow with opacity
      primaryColorOpacity: '#FF634766', // Primary with opacity
      
      // Freebie Colors
      freebiesBg: '#FFE4E1', // Misty rose background for freebies
      freebieTag: '#32CD32', // Fresh green tag
      
      // Product Offer Colors
      productOfferBgStart: '#FFF5EE', // Warm light gradient start
      productOfferBgEnd: '#FFFFFF', // White gradient end
      
      // Rating Colors - Food-themed
      ratingColors: {
        bgPrimaryLight: '#FFD700', // Golden yellow
        bgSecondaryLight: '#F5DEB3', // Wheat
        bgSuccessPrimaryLight: '#228B22', // Forest green
        bgSuccessPrimaryTransparent: '#228B220D',
        bgSuccessSecondaryLight: '#90EE90', // Light green
        bgWarningPrimaryLight: '#FF8C00', // Dark orange
        bgWarningPrimaryTransparent: '#FF8C000D',
        bgWarningSecondaryLight: '#FFA500', // Orange
        bgErrorPrimaryLight: '#B22222', // Fire brick
        bgErrorPrimaryTransparent: '#B222220D',
        borderPrimaryLight: '#DAA520', // Goldenrod
        borderSecondaryLight: '#CD853F', // Peru
        borderSecondaryDark: 'transparent'
      }
    },
    dark: {
      // Dark mode - Sophisticated and warm
      primaryBackground: '#1A0F0A', // Very dark brown
      primaryText: '#F5E6D3', // Warm cream text
      secondaryText: '#D2B48C', // Tan secondary text
      primaryColor: '#FF6347', // Same tomato red
      ctaHover: '#FF4500', // Orange red hover
      accentColor: '#FFA500', // Bright orange
      success: '#228B22', // Forest green
      warning: '#FF8C00', // Dark orange
      error: '#DC143C', // Deep red
      bordersDividers: '#3D2914', // Dark brown borders
      cardsContainers: '#2F1B14', // Dark brown cards
      primaryIconColor: '#D2B48C', // Tan icons
      hoverActiveIconColor: '#FF6347', // Tomato active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#4A2C17', // Darker brown borders
      tertiaryButtonHoverBg: '#3D2914', // Dark hover
      secondaryBackground: '#2F1B14', // Dark secondary
      innerAlignmentBorder: '#FF6347', // Tomato border
      orderStatusBar: '#3D2914', // Dark status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#2F1B14',
      secondaryActiveBackground: '#FF63471A',
      buttonActiveBg: '#FF634766',
      warningWithOpacity: '#FF8C0021',
      primaryColorOpacity: '#FF634766',
      
      // Freebie Colors
      freebiesBg: '#3D2914', // Dark warm background
      freebieTag: '#32CD32', // Fresh green tag
      
      // Product Offer Colors
      productOfferBgStart: '#4A2C17', // Dark brown gradient start
      productOfferBgEnd: '#2F1B14', // Dark brown gradient end
      
      // Rating Colors (same as light for consistency)
      ratingColors: {
        bgPrimaryLight: '#FFD700',
        bgSecondaryLight: '#F5DEB3',
        bgSuccessPrimaryLight: '#228B22',
        bgSuccessPrimaryTransparent: '#228B220D',
        bgSuccessSecondaryLight: '#90EE90',
        bgWarningPrimaryLight: '#FF8C00',
        bgWarningPrimaryTransparent: '#FF8C000D',
        bgWarningSecondaryLight: '#FFA500',
        bgErrorPrimaryLight: '#B22222',
        bgErrorPrimaryTransparent: '#B222220D',
        borderPrimaryLight: '#DAA520',
        borderSecondaryLight: '#CD853F',
        borderSecondaryDark: 'transparent'
      }
    }
  },
  
  // Typography - Friendly and approachable
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  baseFontSize: '16px',
  
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800'
  },
  
  fontSizes: {
    xss: '12px',
    small: '14px',
    description: '16px',
    h1: '42px',
    h2: '28px',
    h3: '22px',
    h4: '19px',
    h5: '16px',
    h6: '14px'
  },
  
  buttonStyles: {
    light: {
      primary: {
        background: '#FF6347',
        text: '#FFFFFF',
        hoverBackground: '#FF4500',
        hoverText: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: '#FFFFFF',
        text: '#FF6347',
        hoverBackground: '#FFF8F5',
        hoverText: '#FF4500',
        borderColor: '#FF6347',
        borderWidth: '2px',
        fontSize: '16px'
      }
    },
    dark: {
      primary: {
        background: '#FF6347',
        text: '#FFFFFF',
        hoverBackground: '#FF4500',
        hoverText: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: 'transparent',
        text: '#FF6347',
        hoverBackground: '#FF634733',
        hoverText: '#FF4500',
        borderColor: '#FF6347',
        borderWidth: '2px',
        fontSize: '16px'
      }
    }
  }
};

/**
 * Fresh Garden Theme - Natural green and earth tones
 * Perfect for organic food, healthy eating, and farm-to-table restaurants
 * Colors evoke freshness, health, and natural ingredients
 */
const FRESH_GARDEN_THEME: ThemeConfig = {
  themeColors: {
    light: {
      // Core Theme Colors - Fresh and natural
      primaryBackground: '#F8FDF8', // Very light mint
      primaryText: '#1A1A1A', // Near-black charcoal for better readability
      secondaryText: '#52796F', // Medium sage green
      primaryColor: '#2D6A4F', // Forest green - main brand color
      ctaHover: '#1B4332', // Darker green for hover
      accentColor: '#8FBC8F', // Light sage green accent
      success: '#228B22', // Forest green for success
      warning: '#DAA520', // Goldenrod for warnings
      error: '#B22222', // Fire brick for errors
      bordersDividers: '#D8E2DC', // Light sage borders
      cardsContainers: '#FFFFFF', // Clean white cards
      primaryIconColor: '#52796F', // Sage green icons
      hoverActiveIconColor: '#2D6A4F', // Forest green for active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#95D5B2', // Light green borders
      tertiaryButtonHoverBg: '#F1F8E9', // Very light green hover
      secondaryBackground: '#F8FDF8', // Light mint background
      innerAlignmentBorder: '#8FBC8F', // Sage green border
      orderStatusBar: '#E8F5E8', // Light green status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#2D6A4F33', // Forest green with opacity
      secondaryActiveBackground: '#2D6A4F1A', // Forest green with light opacity
      buttonActiveBg: '#2D6A4F66', // Forest green active background
      warningWithOpacity: '#DAA52021', // Goldenrod with opacity
      primaryColorOpacity: '#2D6A4F66', // Primary with opacity
      
      // Freebie Colors
      freebiesBg: '#E1F0D9', // Light green background for freebies
      freebieTag: '#228B22', // Forest green tag
      
      // Product Offer Colors
      productOfferBgStart: '#E6FFE7', // Light green gradient start
      productOfferBgEnd: '#FFFFFF', // White gradient end
      
      // Rating Colors - Nature-themed
      ratingColors: {
        bgPrimaryLight: '#DAA520', // Goldenrod
        bgSecondaryLight: '#F0F8E8', // Light green
        bgSuccessPrimaryLight: '#228B22', // Forest green
        bgSuccessPrimaryTransparent: '#228B220D',
        bgSuccessSecondaryLight: '#90EE90', // Light green
        bgWarningPrimaryLight: '#FF8C00', // Dark orange
        bgWarningPrimaryTransparent: '#FF8C000D',
        bgWarningSecondaryLight: '#DAA520', // Goldenrod
        bgErrorPrimaryLight: '#B22222', // Fire brick
        bgErrorPrimaryTransparent: '#B222220D',
        borderPrimaryLight: '#2D6A4F', // Forest green
        borderSecondaryLight: '#8FBC8F', // Sage green
        borderSecondaryDark: 'transparent'
      }
    },
    dark: {
      // Dark mode - Deep and earthy
      primaryBackground: '#0A1F0F', // Very dark green
      primaryText: '#E8F5E8', // Light mint text
      secondaryText: '#95D5B2', // Light green secondary text
      primaryColor: '#52796F', // Sage green (lighter for dark mode)
      ctaHover: '#74A892', // Lighter sage hover
      accentColor: '#8FBC8F', // Light sage accent
      success: '#228B22', // Forest green
      warning: '#DAA520', // Goldenrod
      error: '#DC143C', // Deep red
      bordersDividers: '#1B4332', // Dark forest borders
      cardsContainers: '#163020', // Dark green cards
      primaryIconColor: '#95D5B2', // Light green icons
      hoverActiveIconColor: '#8FBC8F', // Sage active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#2D6A4F', // Forest green borders
      tertiaryButtonHoverBg: '#1B4332', // Dark hover
      secondaryBackground: '#163020', // Dark secondary
      innerAlignmentBorder: '#52796F', // Sage border
      orderStatusBar: '#1B4332', // Dark status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#163020',
      secondaryActiveBackground: '#52796F1A',
      buttonActiveBg: '#52796F66',
      warningWithOpacity: '#DAA52021',
      primaryColorOpacity: '#52796F66',
      
      // Freebie Colors
      freebiesBg: '#0F2A01', // Very dark green background
      freebieTag: '#228B22', // Forest green tag
      
      // Product Offer Colors
      productOfferBgStart: '#003402', // Dark green gradient start
      productOfferBgEnd: '#163020', // Dark green gradient end
      
      // Rating Colors (same as light for consistency)
      ratingColors: {
        bgPrimaryLight: '#DAA520',
        bgSecondaryLight: '#F0F8E8',
        bgSuccessPrimaryLight: '#228B22',
        bgSuccessPrimaryTransparent: '#228B220D',
        bgSuccessSecondaryLight: '#90EE90',
        bgWarningPrimaryLight: '#FF8C00',
        bgWarningPrimaryTransparent: '#FF8C000D',
        bgWarningSecondaryLight: '#DAA520',
        bgErrorPrimaryLight: '#B22222',
        bgErrorPrimaryTransparent: '#B222220D',
        borderPrimaryLight: '#2D6A4F',
        borderSecondaryLight: '#8FBC8F',
        borderSecondaryDark: 'transparent'
      }
    }
  },
  
  // Typography - Clean and modern
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  baseFontSize: '16px',
  
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800'
  },
  
  fontSizes: {
    xss: '12px',
    small: '14px',
    description: '16px',
    h1: '40px',
    h2: '27px',
    h3: '21px',
    h4: '18px',
    h5: '16px',
    h6: '14px'
  },
  
  buttonStyles: {
    light: {
      primary: {
        background: '#2D6A4F',
        text: '#FFFFFF',
        hoverBackground: '#1B4332',
        hoverText: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: '#FFFFFF',
        text: '#2D6A4F',
        hoverBackground: '#F8FDF8',
        hoverText: '#1B4332',
        borderColor: '#2D6A4F',
        borderWidth: '2px',
        fontSize: '16px'
      }
    },
    dark: {
      primary: {
        background: '#52796F',
        text: '#FFFFFF',
        hoverBackground: '#74A892',
        hoverText: '#FFFFFF',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: 'transparent',
        text: '#52796F',
        hoverBackground: '#52796F33',
        hoverText: '#74A892',
        borderColor: '#52796F',
        borderWidth: '2px',
        fontSize: '16px'
      }
    }
  }
};

/**
 * Classic Plateaway Theme - Original brand colors
 * This is a permanent preset based on the original environment configuration
 * Preserves the classic Plateaway look with warm yellows and earth tones
 */
const CLASSIC_PLATEAWAY_THEME: ThemeConfig = {
  themeColors: {
    light: {
      // Core Theme Colors - Warm and inviting
      primaryBackground: '#FAF9F1', // Warm cream background
      primaryText: '#2D2D2D', // Dark gray text for readability
      secondaryText: '#757575', // Medium gray for secondary text
      primaryColor: '#F2C94C', // Signature yellow - main brand color
      ctaHover: '#FBC02D', // Bright yellow for hover states
      accentColor: '#FF6B00', // Orange accent
      success: '#66BB6A', // Fresh green for success
      warning: '#FFA726', // Orange for warnings
      error: '#F44336', // Red for errors
      bordersDividers: '#D7D5C4', // Light beige borders
      cardsContainers: '#FFFFFF', // Clean white cards
      primaryIconColor: '#424242', // Dark gray icons
      hoverActiveIconColor: '#F2C94C', // Yellow for active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#323232', // Dark borders
      tertiaryButtonHoverBg: '#f0f0f0', // Light gray hover
      secondaryBackground: '#FAF9F1', // Warm cream background
      innerAlignmentBorder: '#ECC9FE', // Light purple border
      orderStatusBar: '#FFF0E5', // Light peach status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#F2C94C0D', // Yellow with opacity
      secondaryActiveBackground: '#F2C94C1A', // Yellow with light opacity
      buttonActiveBg: '#F2C94C33', // Yellow active background
      warningWithOpacity: '#FFA72621', // Orange with opacity
      primaryColorOpacity: '#F2C94C66', // Primary with opacity
      
      // Freebie Colors
      freebiesBg: '#E1F0D9', // Light green background for freebies
      freebieTag: '#66BB6A', // Green tag
      
      // Product Offer Colors
      productOfferBgStart: '#E6FFE7', // Light green gradient start
      productOfferBgEnd: '#FFFFFF', // White gradient end
      
      // Rating Colors
      ratingColors: {
        bgPrimaryLight: '#F3BF05', // Golden yellow
        bgSecondaryLight: '#E1E3E5', // Light gray
        bgSuccessPrimaryLight: '#009F06', // Green
        bgSuccessPrimaryTransparent: '#009F060D',
        bgSuccessSecondaryLight: '#43D652', // Light green
        bgWarningPrimaryLight: '#CBEC00', // Lime yellow
        bgWarningPrimaryTransparent: '#CBEC000D',
        bgWarningSecondaryLight: '#FFB800', // Orange
        bgErrorPrimaryLight: '#FF0000', // Red
        bgErrorPrimaryTransparent: '#FF00000D',
        borderPrimaryLight: '#D9A900', // Dark golden
        borderSecondaryLight: '#94A0AF', // Blue gray
        borderSecondaryDark: 'transparent'
      }
    },
    dark: {
      // Dark mode - Sophisticated and warm
      primaryBackground: '#121212', // Very dark gray
      primaryText: '#EDEDED', // Light gray text
      secondaryText: '#B0B0B0', // Medium gray secondary text
      primaryColor: '#F1C40F', // Bright yellow (lighter for dark mode)
      ctaHover: '#F9A825', // Golden yellow hover
      accentColor: '#FF6B00', // Orange accent
      success: '#388E3C', // Dark green
      warning: '#FB8C00', // Dark orange
      error: '#D32F2F', // Dark red
      bordersDividers: '#121212', // Dark borders
      cardsContainers: '#212121', // Dark gray cards
      primaryIconColor: '#B0B0B0', // Light gray icons
      hoverActiveIconColor: '#F1C40F', // Yellow active icons
      white: '#FFFFFF',
      black: '#000000',
      
      // Additional Theme Colors
      borders: '#ffffff1a', // White with opacity borders
      tertiaryButtonHoverBg: '#f0f0f0', // Light hover (override for dark)
      secondaryBackground: '#FAF9F1', // Light background (override)
      innerAlignmentBorder: '#ECC9FE', // Light purple border
      orderStatusBar: '#353535', // Dark gray status bar
      
      // Colors with Opacity
      tertiaryActiveBackground: '#212121', // Dark gray active
      secondaryActiveBackground: '#F1C40F1A', // Yellow with light opacity
      buttonActiveBg: '#F1C40F33', // Yellow active background
      warningWithOpacity: '#FB8C0021', // Orange with opacity
      primaryColorOpacity: '#F1C40F66', // Primary with opacity
      
      // Freebie Colors
      freebiesBg: '#0F2A01', // Very dark green background
      freebieTag: '#66BB6A', // Green tag
      
      // Product Offer Colors
      productOfferBgStart: '#003402', // Dark green gradient start
      productOfferBgEnd: '#212121', // Dark gray gradient end
      
      // Rating Colors (same as light for consistency)
      ratingColors: {
        bgPrimaryLight: '#F3BF05',
        bgSecondaryLight: '#E1E3E5',
        bgSuccessPrimaryLight: '#009F06',
        bgSuccessPrimaryTransparent: '#009F060D',
        bgSuccessSecondaryLight: '#43D652',
        bgWarningPrimaryLight: '#CBEC00',
        bgWarningPrimaryTransparent: '#CBEC000D',
        bgWarningSecondaryLight: '#FFB800',
        bgErrorPrimaryLight: '#FF0000',
        bgErrorPrimaryTransparent: '#FF00000D',
        borderPrimaryLight: '#D9A900',
        borderSecondaryLight: '#94A0AF',
        borderSecondaryDark: 'transparent'
      }
    }
  },
  
  // Typography - Classic and readable
  fontFamily: 'Arial',
  baseFontSize: '16px',
  
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800'
  },
  
  fontSizes: {
    xss: '12px',
    small: '14px',
    description: '16px',
    h1: '40px',
    h2: '27px',
    h3: '21px',
    h4: '18px',
    h5: '16px',
    h6: '14px'
  },
  
  buttonStyles: {
    light: {
      primary: {
        background: '#F2C94C',
        text: '#2D2D2D',
        hoverBackground: '#F2C94C',
        hoverText: '#2D2D2D',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: '#FFFFFF',
        text: '#2D2D2D',
        hoverBackground: '#FFFFFF',
        hoverText: '#2D2D2D',
        borderColor: '#F2C94C',
        borderWidth: '1px',
        fontSize: '16px'
      }
    },
    dark: {
      primary: {
        background: '#F1C40F',
        text: '#2D2D2D',
        hoverBackground: '#F1C40F',
        hoverText: '#2D2D2D',
        borderColor: 'transparent',
        borderWidth: '0px',
        fontSize: '16px'
      },
      secondary: {
        background: 'transparent',
        text: '#EDEDED',
        hoverBackground: 'transparent',
        hoverText: '#EDEDED',
        borderColor: '#F1C40F',
        borderWidth: '1px',
        fontSize: '16px'
      }
    }
  }
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic-plateaway',
    name: 'Classic Plateaway',
    description: 'Original Plateaway brand colors with warm yellows and earth tones - permanently preserved',
    config: CLASSIC_PLATEAWAY_THEME
  },
  {
    id: 'spicy-tomato',
    name: 'Spicy Tomato',
    description: 'Energetic red and orange palette perfect for fast food and delivery',
    config: SPICY_TOMATO_THEME
  },
  {
    id: 'fresh-garden',
    name: 'Fresh Garden',
    description: 'Natural green and earth tones ideal for organic and healthy food',
    config: FRESH_GARDEN_THEME
  }
];

export const getThemePresetById = (id: string): ThemePreset | undefined => {
  return THEME_PRESETS.find(preset => preset.id === id);
};

export const getThemePresetNames = (): Array<{id: string, name: string, description: string}> => {
  return THEME_PRESETS.map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description
  }));
};
