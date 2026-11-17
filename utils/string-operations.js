/**
 * Truncates a number to a fixed number of decimal places (no rounding).
 * @param value The number to truncate.
 * @param decimals Number of decimal places (default: 2)
 * @returns The truncated number as a float.
 */
export const truncateToFloat = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
};

/**
 * Truncates a number to a fixed number of decimal places (no rounding) and returns as a string with trailing zeros.
 * @param value The number to truncate.
 * @param decimals Number of decimal places (default: 2)
 * @returns The truncated number as a string with fixed decimals.
 */
export const truncateToFixed = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return (Math.trunc(value * factor) / factor).toFixed(decimals);
};
