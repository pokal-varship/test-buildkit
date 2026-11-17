/**
 * Rating color utility functions for consistent styling across the application
 */

/**
 * Get the rating border/text color based on rating value
 * @param rating - Rating value as string or number
 * @returns CSS variable for the appropriate color
 */
export const getRatingColor = (rating: string | number): string => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    
    if (numRating < 2) return 'var(--rating-bg-error-primary)';
    if (numRating >= 2 && numRating < 3) return 'var(--rating-bg-warning-secondary)';
    if (numRating >= 3 && numRating < 4) return 'var(--rating-bg-warning-primary)';
    return 'var(--rating-bg-success-primary)';
};

/**
 * Get the rating background color (with opacity) based on rating value
 * @param rating - Rating value as string or number
 * @returns CSS variable for the appropriate background color
 */
export const getRatingBackgroundColor = (rating: string | number): string => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    
    if (numRating < 2) return 'var(--rating-bg-error-opacity)';
    if (numRating >= 2 && numRating < 3) return 'var(--rating-bg-warning-secondary-opacity)';
    if (numRating >= 3 && numRating < 4) return 'var(--rating-bg-warning-opacity)';
    return 'var(--rating-bg-success-opacity)';
};

/**
 * Get the rating border color based on rating value
 * Alias for getRatingColor for semantic clarity
 * @param rating - Rating value as string or number
 * @returns CSS variable for the appropriate border color
 */
export const getRatingBorderColor = getRatingColor;

/**
 * Get the progress bar CSS class based on star rating
 * @param star - Star rating as string or number
 * @returns CSS class name for the progress bar
 */
export const getProgressBarClass = (star: string | number): string => {
    const numRating = typeof star === 'string' ? parseFloat(star) : star;
    
    if (numRating < 2) return 'progress-bar-1';
    if (numRating >= 2 && numRating < 3) return 'progress-bar-2';
    if (numRating >= 3 && numRating < 4) return 'progress-bar-3';
    if (numRating >= 4 && numRating < 5) return 'progress-bar-4';
    return 'progress-bar-5';
};

/**
 * Format rating number for display
 * Shows whole number if no decimal, otherwise shows one decimal place
 * @param rating - Numeric rating value
 * @returns Formatted rating string
 */
export const formatRating = (rating: number): string => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
};
