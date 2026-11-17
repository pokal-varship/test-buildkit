/**
 * Reserved routes that should not be treated as store slugs.
 * These are hardcoded routes in the app directory that take precedence.
 */
export const RESERVED_ROUTES: string[] = [
    // Static pages
    'about-us',
    'admin',
    'api',
    'draft',
    'menu',
    'orders',
    'wallet',
    'pages',
    'products',
    'RestaurantMenu',
    'review',
    'theme-config',
    'events',
    'payment',
    'editProfile',
    
    // Special routes
    'edit',           // Used for page builder edit mode
    'cart',           // Store cart (handled by [storeSlug]/cart)
    'checkout',       // Store checkout (handled by [storeSlug]/checkout)
    'wishlist',       // Wishlist (handled by [storeSlug]/[menuSlug]/wishlist)
    
    // System routes
    '_next',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    'manifest.json',
];

/**
 * Checks if a given slug is a reserved route.
 * 
 * @param {string} slug - The slug to check
 * @returns {boolean} True if the slug is reserved
 */
export const isReservedRoute = (slug: string): boolean => {
    return RESERVED_ROUTES.includes(slug);
};
