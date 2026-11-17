const tenantConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    webUrl: process.env.NEXT_PUBLIC_WEBSITE_URL,
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
    supportAddress: process.env.NEXT_PUBLIC_SUPPORT_ADDRESS,
    supportHours: process.env.NEXT_PUBLIC_SUPPORT_HOURS,
    currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL,
    currencyCode: process.env.NEXT_PUBLIC_CURRENCY_CODE,
    exchangeRate: process.env.NEXT_PUBLIC_EXCHANGE_RATE,
    priceDisplayFormat: process.env.NEXT_PUBLIC_PRICE_DISPLAY_FORMAT,
    currencySymbolPrefix: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL_PREFIX || "",
    currencySymbolSuffix: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL_SUFFIX || "",
    hideTrailingZeros: process.env.NEXT_PUBLIC_HIDE_TRAILING_ZEROS,
    timeZone: process.env.NEXT_PUBLIC_TIME_ZONE,
    disableTimezone: process.env.NEXT_PUBLIC_DISABLE_TIMEZONE === "true",
    timeDisplayFormat: process.env.NEXT_PUBLIC_TIME_DISPLAY_FORMAT,
    dateDisplayFormat: process.env.NEXT_PUBLIC_DATE_DISPLAY_FORMAT,
    weightUnit: process.env.NEXT_PUBLIC_WEIGHT_UNIT,
    dimensionUnit: process.env.NEXT_PUBLIC_DIMENSION_UNIT,
    distanceUnit: process.env.NEXT_PUBLIC_DISTANCE_UNIT,
    displayFormat: process.env.NEXT_PUBLIC_DISPLAY_FORMAT,
    displayCategoryName: (process.env.NEXT_PUBLIC_DISPLAY_CATEGORY_NAME ?? "true") === "true",
    storeLanguageDefault: process.env.NEXT_PUBLIC_STORE_LANGUAGE_DEFAULT,
    storeLanguageSecondary: process.env.NEXT_PUBLIC_STORE_LANGUAGE_SECONDARY,
    dashboardLanguage: process.env.NEXT_PUBLIC_DASHBOARD_LANGUAGE,
    lightLogoUrl:(process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '') + process.env.NEXT_PUBLIC_LIGHT_LOGO_URL,
    darkLogoUrl: (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '') + process.env.NEXT_PUBLIC_DARK_LOGO_URL,
    faviconUrl: (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '') + process.env.NEXT_PUBLIC_FAVICON_URL,
    copyright: process.env.NEXT_PUBLIC_COPYRIGHT,
    socialFacebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    socialInstagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    supportCountryCode: process.env.NEXT_PUBLIC_SUPPORT_COUNTRY_CODE,
    supportPhoneIso: process.env.NEXT_PUBLIC_SUPPORT_PHONE_ISO,
    currencyName: process.env.NEXT_PUBLIC_CURRENCY_NAME,
    productPlaceholderImageUrl: process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE_URL,
    eventBannerMainImage: process.env.NEXT_PUBLIC_EVENT_BANNER_MAIN_IMAGE || '',
    footerBrandDescription: process.env.NEXT_PUBLIC_FOOTER_BRAND_DESCRIPTION || "",
    imageBaseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '',
    videoBaseUrl: process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '',
    showPdpProductTabs: (process.env.NEXT_PUBLIC_SHOW_PDP_PRODUCT_TABS ?? "true") === "true",
    showCaloriesInfo: (process.env.NEXT_PUBLIC_SHOW_CALORIES_INFO ?? "true") === "true",
    showOfferFilter: (process.env.NEXT_PUBLIC_SHOW_OFFER_FILTER ?? "true") === "true",
    showStrikethroughPrice: (process.env.NEXT_PUBLIC_SHOW_STRIKETHROUGH_PRICE ?? "true") === "true",
    showPdpReviewsList: (process.env.NEXT_PUBLIC_SHOW_PDP_REVIEWS_LIST ?? "true") === "true",
    showStoreHoursTime: (process.env.NEXT_PUBLIC_SHOW_STORE_HOURS_TIME ?? "true") === "true",
    showDietaryRestrictions: (process.env.NEXT_PUBLIC_SHOW_DIETARY_RESTRICTIONS ?? "true") === "true",
    showContainsMeat: (process.env.NEXT_PUBLIC_SHOW_CONTAINS_MEAT ?? "true") === "true",
    showDietaryIndicator: (process.env.NEXT_PUBLIC_SHOW_DIETARY_INDICATOR ?? "true") === "true",
    showCategoryDescription: (process.env.NEXT_PUBLIC_SHOW_CATEGORY_DESCRIPTION ?? "true") === "true",
    authPhoneOnlyLogin: process.env.NEXT_PUBLIC_AUTH_PHONE_ONLY_LOGIN === "true",
    customiseAsPerYourTaste: process.env.NEXT_PUBLIC_CUSTOMISE_AS_PER_YOUR_TASTE || "",
    cookingInstructions: process.env.NEXT_PUBLIC_COOKING_INSTRUCTIONS || "",
    rateRestaurantTitle: process.env.NEXT_PUBLIC_RATE_RESTAURANT_TITLE || "",
    rateFoodTitle: process.env.NEXT_PUBLIC_RATE_FOOD_TITLE || "",
};



export const getTenantConfig = () => {
    return tenantConfig;
}


export default tenantConfig;



