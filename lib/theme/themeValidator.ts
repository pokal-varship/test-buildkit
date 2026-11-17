/**
 * Theme Validation Utilities
 * Validates color, font size, and font weight values
 */

// Type for nested color objects
type ColorObject = {
  [key: string]: string | ColorObject;
};

/**
 * Validates hex color format
 * Accepts #RRGGBB or #RRGGBBAA format
 */
export function isValidHexColor(color: string): boolean {
  if (!color) return false;
  
  // Allow special CSS color names
  if (color === 'transparent' || color === 'inherit' || color === 'currentColor') {
    return true;
  }
  
  // Validate hex format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(color);
}

/**
 * Validates font size in px format
 * Must be positive number with 'px' suffix
 */
export function isValidFontSize(size: string): boolean {
  if (!size) return false;
  
  const match = size.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) return false;
  
  const value = parseFloat(match[1]);
  return value > 0;
}

/**
 * Validates font weight
 * Must be numeric string from 100-900 in steps of 100
 */
export function isValidFontWeight(weight: string): boolean {
  if (!weight) return false;
  
  const numWeight = parseInt(weight, 10);
  return (
    !isNaN(numWeight) &&
    numWeight >= 100 &&
    numWeight <= 900 &&
    numWeight % 100 === 0
  );
}

/**
 * Validates border width in px format
 * Can be 0 or positive number with 'px' suffix
 */
export function isValidBorderWidth(width: string): boolean {
  if (!width) return false;
  
  const match = width.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) return false;
  
  const value = parseFloat(match[1]);
  return value >= 0;
}

/**
 * Validates all color properties in theme config
 */
export function validateThemeColors(colors: ColorObject): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const validateColorObject = (obj: ColorObject, path: string = '') => {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        validateColorObject(value as ColorObject, currentPath);
      } else if (typeof value === 'string' && !isValidHexColor(value)) {
        errors.push(`Invalid color at ${currentPath}: ${value}`);
      }
    }
  };
  
  validateColorObject(colors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates font sizes
 */
export function validateFontSizes(fontSizes: Record<string, string>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const key in fontSizes) {
    const value = fontSizes[key];
    if (!isValidFontSize(value)) {
      errors.push(`Invalid font size for ${key}: ${value} (must be in px format, e.g., "16px")`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates font weights
 */
export function validateFontWeights(fontWeights: Record<string, string>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const key in fontWeights) {
    const value = fontWeights[key];
    if (!isValidFontWeight(value)) {
      errors.push(`Invalid font weight for ${key}: ${value} (must be 100-900 in steps of 100)`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

