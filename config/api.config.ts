export const PAGE_CONFIG_ENDPOINT = "/e-commerce/v1/tenant/config"
export const STORES_ENDPOINT = "/e-commerce/v1/tenant/store"
export const STORES_CATEGORIES_ENDPOINT = "/e-commerce/v1/tenant/menu/categories"
export const SEARCH_INPUT_SUGGESTIONS_ENDPOINT = "/e-commerce/v1/tenant/recentSearch"
export const SEARCH_INPUT_SUGGESTIONS_GET = "/e-commerce/v1/tenant/product/combo"
export const COMBO_PRODUCT_ENDPOINT = "/e-commerce/v1/tenant/product"
export const PRODUCTS_LIST_ENDPOINT = "/e-commerce/v1/tenant/products";


// Guest Auth
export const GUEST_AUTH_ENDPOINT = "/e-commerce/v1/tenant/customer/guest-auth"
export const REFRESH_TOKEN_AUTH_ENDPOINT = "/e-commerce/v1/refreshToken"

// login
export const LOGIN_ENDPOINT = "/e-commerce/v1/tenant/customer/login"

// signup
export const SIGNUP_ENDPOINT = "/e-commerce/v1/tenant/customer/signup"

// validate phone
export const VALIDATE_PHONE_ENDPOINT = "/e-commerce/v1/tenant/customer/validate/phone"


// tenant/customer/login/email/otp
export const LOGIN_EMAIL_OTP_ENDPOINT = "/e-commerce/v1/tenant/customer/loginWithOtp"

// logout
export const LOGOUT_ENDPOINT = "/e-commerce/v1/logout"

//update profile
export const UPDATE_PROFILE_ENDPOINT = '/e-commerce/v1/tenant/customer'
export const UPDATE_EMAIL_ENDPOINT = '/e-commerce/v1/tenant/customer/update/email'
export const UPDATE_PHONE_ENDPOINT = '/e-commerce/v1/tenant/customer/update/phoneNumber'

// tenant/cart/add
export const CART_ADD_ENDPOINT = "/e-commerce/v1/tenant/cart"


// tenant/customer/tokenExchange?storefrontId
export const TOKEN_EXCHANGE_ENDPOINT = "/e-commerce/v1/tenant/customer/tokenExchange"

//pdp endpoints
export const PRODUCT_DETAILS_ENDPOINT = "/e-commerce/v1/tenant/product"
export const ADD_TO_CART_ENDPOINT = "/e-commerce/v1/tenant/cart"
export const PRODUCT_REVIEWS_ENDPOINT = "/reviews-svc/v1/reviews"


// Integrations (payment gateway config)
export const INTEGRATIONS_CONFIG_ENDPOINT = "/e-commerce/v1/integrations/config"

// payment endpoints
export const PAYMENT_INTENT_ENDPOINT = "/integration-svc/v1/payments/intent"
export const PAYMENT_WEBHOOK_ENDPOINT = "/e-commerce/v1/payments/webhook"
export const PAYMENT_VERIFY_ENDPOINT = "/e-commerce/v1/payment/verify"

// Order page endpoints
export const GET_ALL_ORDERS_ENDPOINT = "/e-commerce/v1/tenant/order";
export const OFFERS_ENDPOINT = "/e-commerce/v1/tenant/offer";
export const GET_ORDER_CANCEL_REASONS_ENDPOINT = "/e-commerce/v1/cancellation/reason";
/** Settings → Reasons catalog types (isReasonRequired / isAllowOther). */
export const GET_ORDER_CANCEL_REASON_TYPES_ENDPOINT =
  "/e-commerce/v1/cancellation/reason/types";
/** Catalog type: Customer cancels order (ORDER). */
export const CUSTOMER_ORDER_CANCEL_REASON_TYPE_ID = 2;
export const CUSTOMER_ORDER_CANCEL_REASON_CATEGORY = "ORDER";
export const CANCEL_ORDER_ENDPOINT = "/e-commerce/v1/tenant/order/cancel";
/** Razorpay: cancel order when payment dismissed or failed */
export const RAZORPAY_ORDER_CANCEL_ENDPOINT = "/e-commerce/v1/order/cancel";
/** Catalog type: Customer deletes account (ACCOUNTS). */
export const CUSTOMER_DELETE_ACCOUNT_REASON_TYPE_ID = 9;
export const CUSTOMER_DELETE_ACCOUNT_REASON_CATEGORY = "ACCOUNTS";
/** Self-delete: PATCH status DELETED (omit body `id` so BE uses type 9). */
export const DELETE_CUSTOMER_ACCOUNT_ENDPOINT = "/e-commerce/v1/customer";
// Customer Address endpoints
export const CUSTOMER_ADDRESS_ENDPOINT = "/e-commerce/v1/tenant/customer/address"

// Checkout endpoints
export const CHECKOUT_ENDPOINT = "/e-commerce/v1/tenant/order"


// Calculate Delivery Fee
export const CALCULATE_DELIVERY_FEE_ENDPOINT = "/e-commerce/v1/tenant/order/calculateDeliveryFee"


// tenant/cart/upsell-products
export const UPSALE_PRODUCTS_ENDPOINT = "/e-commerce/v1/tenant/cart/upsell-products"


// Product  reviews
export const PRODUCT_PARAMETER_ENDPOINT = "/reviews-svc/v1/reviews/productParameter"
export const REVIEW_ENDPOINT = "/reviews-svc/v1/reviews"
export const REVIEW_LIKE_ENDPOINT = "/reviews-svc/v1/reviews/like"
export const REVIEW_REPORT_ENDPOINT = "/reviews-svc/v1/reviews/reports"
export const PRODUCT_USER_REVIEW_LIKES_ENDPOINT = "/reviews-svc/v1/reviews/product/user/likes"

// Store reviews
export const STORE_PARAMETER_ENDPOINT = "/reviews-svc/v1/reviews/storeParameter"
export const STORE_REVIEW_ENDPOINT = "/reviews-svc/v1/reviews/storeReview"
export const STORE_REVIEW_USER_ENDPOINT = "/reviews-svc/v1/reviews/storeReview/user"
export const STORE_REVIEW_STORE_ENDPOINT = "/reviews-svc/v1/reviews/storeReview/store"

// User Promotions List
export const USER_PROMOTIONS_LIST_ENDPOINT = "/promo-svc/v1/user/promotions/list";

// Freebie offer
export const FREEBIE_OFFER_ENDPOINT = "/e-commerce/v1/tenant/cart/freebie-offer"

// Upload
export const UPLOAD_ENDPOINT = "/e-commerce/v1/upload/multiple"

// Event endpoints
export const EVENT_ENDPOINT = "/e-commerce/v1/tenant/event"

// About us endpoints
export const ABOUT_US_ENDPOINT = "/e-commerce/v1/teamMembers"

// Storefront endpoints
export const GET_PRODUCT_STORES_ENDPOINT = "/e-commerce/v1/tenant/product/getStores"

// Reorder endpoints
export const REORDER_ENDPOINT = "/e-commerce/v1/tenant/order/reorder"

// Page management endpoints
export const PAGES_ENDPOINT = "/e-commerce/v1/pages"
export const PAGES_SLUGS_ENDPOINT = "/e-commerce/v1/pages/slugs"

//wishlist endpoints
export const WISHLIST_ENDPOINT = "/e-commerce/v1/tenant/wishlist"

// Wallet
export const WALLET_ENDPOINT = "/e-commerce/v1/wallet"
export const LOYALTY_SETTINGS_ENDPOINT = "/e-commerce/v1/wallet/loyalty/settings"
export const WALLET_REDEMPTION_PREVIEW_ENDPOINT =
  "/e-commerce/v1/wallet/redemptions/preview"
export const LOYALTY_CONVERT_POINTS_TO_CASH_ENDPOINT =
  "/e-commerce/v1/loyalty/convert/points-to-cash"
export const TRANSACTION_ENDPOINT = "/e-commerce/v1/transaction"
export const WALLET_RECHARGE_INITIATE_ENDPOINT =
  "/e-commerce/v1/transaction/recharge/initiate"

// Popular products endpoint (store-wise; requires tenant_id = store id)
export const POPULAR_PRODUCTS_ENDPOINT = "/ai/api/popular-products-storewise"


// Google auth endpoint
export const GOOGLE_AUTH_ENDPOINT = "/e-commerce/v1/googleAuth/food"

// Theme config endpoint
export const THEME_CONFIG_ENDPOINT = "/e-commerce/v1/tenant/global-config"

// QR flow - resolve QR token to get table/store details
export const QR_RESOLVE_ENDPOINT = "/e-commerce/v1/qr/resolve"
// QR flow - validate table PIN before joining session
export const QR_VALIDATE_PIN_ENDPOINT = "/e-commerce/v1/qr/validate-pin"

// Storefront tables - GET storefronts/tables?tableId=
export const STOREFRONT_TABLES_ENDPOINT = "/e-commerce/v1/storefronts/tables"

// Dine-in sessions - POST storefronts/sessions
export const SESSIONS_ENDPOINT = "/e-commerce/v1/storefronts/sessions"
// Dine-in session - GET storefronts/session
export const SESSION_ENDPOINT = "/e-commerce/v1/storefronts/tickets"
// Dine-in session - create cart from session
export const SESSION_CREATE_CART_ENDPOINT = "/e-commerce/v1/storefronts/sessions/checkout"

// Ticket items - POST add items to ticket (QR/dine-in flow)
export const TICKET_ITEMS_ENDPOINT = "/e-commerce/v1/storefronts/tickets/items"

// Submit ticket to kitchen - PATCH (QR/dine-in flow)
export const TICKET_SUBMIT_ENDPOINT = "/e-commerce/v1/storefronts/tickets/submit"