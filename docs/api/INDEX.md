# 📑 PlateAway API Documentation - Quick Index

> **Jump to any endpoint in 3 clicks or less!**

---

## 🚀 Popular Endpoints (Most Used)

| Endpoint | Method | Purpose | Doc Link |
|----------|--------|---------|----------|
| `/tenant/customer/guest-auth` | POST | Get guest token | [API Docs](./API_DOCUMENTATION.md#1-guest-authentication) |
| `/refreshToken` | GET | Refresh access token | [API Docs](./API_DOCUMENTATION.md#2-refresh-access-token) |
| `/tenant/customer/loginWithOtp` | POST | Request login OTP | [API Docs](./API_DOCUMENTATION.md#3-login-with-email-otp-request-otp) |
| `/tenant/customer/loginWithOtp` | PATCH | Verify login OTP | [API Docs](./API_DOCUMENTATION.md#4-login-with-email-otp-verify-otp) |
| `/tenant/product` | GET | Get product details | [API Docs](./API_DOCUMENTATION.md#14-get-product-details) |
| `/tenant/cart` | GET | Get cart | [API Docs](./API_DOCUMENTATION.md#18-get-cart) |
| `/tenant/cart` | POST | Add to cart | [API Docs](./API_DOCUMENTATION.md#19-add-to-cart) |
| `/tenant/cart` | PATCH | Update cart | [API Docs](./API_DOCUMENTATION.md#20-update-cart) |
| `/tenant/order` | GET | Get orders | [API Docs](./API_DOCUMENTATION.md#31-get-all-orders) |
| `/tenant/order` | POST | Place order | [API Docs](./API_DOCUMENTATION.md#30-checkout--place-order) |

---

## 🗂️ All Endpoints by Category

### 🔐 Authentication (9 endpoints)
- [Guest Auth](./API_DOCUMENTATION.md#1-guest-authentication) - POST `/tenant/customer/guest-auth`
- [Refresh Token](./API_DOCUMENTATION.md#2-refresh-access-token) - GET `/refreshToken`
- [Login OTP Request](./API_DOCUMENTATION.md#3-login-with-email-otp-request-otp) - POST `/tenant/customer/loginWithOtp`
- [Login OTP Verify](./API_DOCUMENTATION.md#4-login-with-email-otp-verify-otp) - PATCH `/tenant/customer/loginWithOtp`
- [Signup](./API_DOCUMENTATION.md#5-signup) - POST `/tenant/customer/signup`
- [Validate Phone](./API_DOCUMENTATION.md#6-validate-phone-number) - POST `/tenant/customer/validate/phone`
- [Google OAuth](./API_DOCUMENTATION.md#7-google-oauth) - POST `/googleAuth`
- [Token Exchange](./API_DOCUMENTATION.md#8-token-exchange) - GET `/tenant/customer/tokenExchange`
- [Logout](./API_DOCUMENTATION.md#9-logout) - POST `/logout`

### 🏪 Store & Menu (4 endpoints)
- [Page Config](./API_DOCUMENTATION.md#10-get-page-configuration) - GET `/tenant/config`
- [Get Stores](./API_DOCUMENTATION.md#11-get-tenant-stores) - GET `/tenant/store`
- [Store Categories](./API_DOCUMENTATION.md#12-get-store-categories) - GET `/tenant/menu/categories`
- [Store Products](./API_DOCUMENTATION.md#13-get-store-products) - GET `/tenant/products`

### 📦 Products (4 endpoints)
- [Product Details](./API_DOCUMENTATION.md#14-get-product-details) - GET `/tenant/product`
- [Combo Product](./API_DOCUMENTATION.md#15-get-combo-product-details) - GET `/tenant/product`
- [Popular Products](./API_DOCUMENTATION.md#16-get-popular-products) - GET `/tenant/product/popular-products`
- [Product Stores](./API_DOCUMENTATION.md#17-get-product-stores) - GET `/tenant/product/getStores`

### 🛒 Cart (6 endpoints)
- [Get Cart](./API_DOCUMENTATION.md#18-get-cart) - GET `/tenant/cart`
- [Add to Cart](./API_DOCUMENTATION.md#19-add-to-cart) - POST `/tenant/cart`
- [Update Cart](./API_DOCUMENTATION.md#20-update-cart) - PATCH `/tenant/cart`
- [Cancel Order](./API_DOCUMENTATION.md#21-cancel-order-clear-cart) - PATCH `/tenant/cart`
- [Upsell Products](./API_DOCUMENTATION.md#22-get-upsell-products) - GET `/tenant/cart/upsell-products`
- [Freebies](./API_DOCUMENTATION.md#23-get-freebie-offers) - GET `/tenant/cart/freebie-offer`

### 📍 Checkout & Address (7 endpoints)
- [Get Addresses](./API_DOCUMENTATION.md#24-get-customer-addresses) - GET `/tenant/customer/address`
- [Add Address](./API_DOCUMENTATION.md#25-add-customer-address) - POST `/tenant/customer/address`
- [Update Address](./API_DOCUMENTATION.md#26-update-customer-address) - PATCH `/tenant/customer/address`
- [Delete Address](./API_DOCUMENTATION.md#27-delete-customer-address) - DELETE `/tenant/customer/address`
- [Calculate Delivery](./API_DOCUMENTATION.md#28-calculate-delivery-fee) - GET `/tenant/order/calculateDeliveryFee`
- [Get Promotions](./API_DOCUMENTATION.md#29-get-promotions-list) - GET `/user/promotions/list`
- [Checkout](./API_DOCUMENTATION.md#30-checkout--place-order) - POST `/tenant/order`

### 📋 Orders (5 endpoints)
- [All Orders](./API_DOCUMENTATION.md#31-get-all-orders) - GET `/tenant/order`
- [Order by ID](./API_DOCUMENTATION.md#32-get-order-by-id) - GET `/tenant/order?orderId=`
- [Cancel Reasons](./API_DOCUMENTATION.md#33-get-order-cancel-reasons) - GET `/cancellation/reason`
- [Cancel Order](./API_DOCUMENTATION.md#34-cancel-order) - PATCH `/tenant/order/cancel`
- [Reorder](./API_DOCUMENTATION.md#35-reorder) - GET `/tenant/order/reorder`

### 💳 Payment (2 endpoints)
- [Create Payment](./API_DOCUMENTATION.md#36-create-payment-intent) - POST `/payments/intent`
- [Payment Webhook](./API_DOCUMENTATION.md#37-payment-webhook) - POST `/payments/webhook`

### ⭐ Reviews (9 endpoints)
- [Product Parameters](./API_DOCUMENTATION.md#38-get-product-parameters-for-reviews) - GET `/reviews/productParameter`
- [Get Product Reviews](./API_DOCUMENTATION.md#39-get-product-reviews) - GET `/reviews`
- [Submit Product Review](./API_DOCUMENTATION.md#41-submit-product-review) - POST `/reviews`
- [Get Order Reviews](./API_DOCUMENTATION.md#40-get-order-reviews) - GET `/reviews?order_id=`
- [Store Parameters](./API_DOCUMENTATION.md#42-get-store-parameters-for-reviews) - GET `/reviews/storeParameter`
- [User Store Reviews](./API_DOCUMENTATION.md#43-get-store-reviews-user) - GET `/reviews/storeReview/user`
- [Homepage Reviews](./API_DOCUMENTATION.md#44-get-store-reviews-homepage) - GET `/reviews/storeReview/store`
- [Testimonials](./API_DOCUMENTATION.md#45-get-customer-reviews-testimonials) - GET `/reviews/storeReview`
- [Submit Store Review](./API_DOCUMENTATION.md#46-submit-store-review) - POST `/reviews/storeReview`

### 👤 Profile (3 endpoints)
- [Update Profile](./API_DOCUMENTATION.md#47-update-profile) - PATCH `/tenant/customer`
- [Request Email Update](./API_DOCUMENTATION.md#48-request-email-update-send-otp) - GET `/tenant/customer/update/email`
- [Verify Email Update](./API_DOCUMENTATION.md#49-verify-email-update-confirm-otp) - PATCH `/tenant/customer`

### ❤️ Wishlist (3 endpoints)
- [Get Wishlist](./API_DOCUMENTATION.md#50-get-wishlist) - GET `/tenant/wishlist`
- [Add to Wishlist](./API_DOCUMENTATION.md#51-add-to-wishlist) - POST `/tenant/wishlist`
- [Remove from Wishlist](./API_DOCUMENTATION.md#52-remove-from-wishlist) - DELETE `/tenant/wishlist`

### 🎁 Offers (1 endpoint)
- [Get Offers](./API_DOCUMENTATION.md#53-get-offers) - GET `/tenant/offer`

### 🔍 Search (3 endpoints)
- [Post Search](./API_DOCUMENTATION.md#54-post-recent-search) - POST `/tenant/recentSearch`
- [Get Recent Searches](./API_DOCUMENTATION.md#55-get-recent-search-suggestions) - GET `/tenant/recentSearch`
- [Delete Search](./API_DOCUMENTATION.md#56-delete-recent-search) - DELETE `/tenant/recentSearch`

### 🎉 Events (2 endpoints)
- [Get Events](./API_DOCUMENTATION.md#57-get-events) - GET `/tenant/event`
- [Event Details](./API_DOCUMENTATION.md#58-get-event-details) - GET `/tenant/event?id=`

### 📤 Upload (1 endpoint)
- [Presigned URL](./API_DOCUMENTATION.md#59-get-presigned-url-for-upload) - POST `/upload/multiple`

### 📄 Pages (2 endpoints)
- [Get Page Draft](./API_DOCUMENTATION.md#60-get-page-draft) - GET `/pages`
- [Publish Page](./API_DOCUMENTATION.md#61-publish-page-draft) - PATCH `/pages`

### 📍 Location (4 external endpoints)
- [Reverse Geocode](./API_DOCUMENTATION.md#62-get-address-from-coordinates-reverse-geocoding) - GET `nominatim.openstreetmap.org/reverse`
- [Search Address](./API_DOCUMENTATION.md#63-search-address) - GET `nominatim.openstreetmap.org/search`
- [Search by Zipcode](./API_DOCUMENTATION.md#64-search-address-by-zipcode) - GET `nominatim.openstreetmap.org/search`
- [IP Info](./API_DOCUMENTATION.md#65-get-ip-information) - GET `ipinfo.io`
- [IP Location](./API_DOCUMENTATION.md#66-get-user-location-ip-based) - GET `ipapi.co/json/`

### 👥 About (1 endpoint)
- [Team Members](./API_DOCUMENTATION.md#67-get-team-members-client) - GET `/teamMembers`

---

## 📱 By Screen/Page

| Screen | # APIs | Doc Link |
|--------|--------|----------|
| Homepage | 5 | [Pages](./API_PAGES_MAPPING.md#2-homepage) |
| Store/Menu | 3 | [Pages](./API_PAGES_MAPPING.md#3-storemenu-page) |
| Product Listing | 5 | [Pages](./API_PAGES_MAPPING.md#4-product-listing-page-plp--category) |
| Product Detail | 8 | [Pages](./API_PAGES_MAPPING.md#5-product-detail-page-pdp) |
| Cart | 6 | [Pages](./API_PAGES_MAPPING.md#6-cart-page) |
| Checkout | 8 | [Pages](./API_PAGES_MAPPING.md#7-checkout-page) |
| Orders List | 2 | [Pages](./API_PAGES_MAPPING.md#8-orders-page-order-history) |
| Order Details | 7 | [Pages](./API_PAGES_MAPPING.md#9-order-details-page) |
| Wishlist | 3 | [Pages](./API_PAGES_MAPPING.md#10-wishlist-page) |
| Profile | 4 | [Pages](./API_PAGES_MAPPING.md#11-profileedit-profile-page) |
| Events | 2 | [Pages](./API_PAGES_MAPPING.md#12-events-page) |
| About Us | 2 | [Pages](./API_PAGES_MAPPING.md#13-about-us-page) |
| Payment | 2 | [Pages](./API_PAGES_MAPPING.md#14-payment-page) |

---

## 🔔 By Modal/Dialog

| Modal | # APIs | Doc Link |
|-------|--------|----------|
| Login Modal | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-login-modal) |
| Verify OTP Modal | 1 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-verify-otp-modal) |
| Signup Modal | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-signup-modal) |
| Logout Modal | 1 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-logout-modal) |
| Customizations Modal | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-multiple-customizations-modal) |
| Instructions Modal | 1 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-special-instructions-modal) |
| Add Address Modal | 4 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-addedit-address-modal) |
| Address Selector | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-mobile-address-selector-modal) |
| Discount Coupons | 0* | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-discount-coupons-modal) |
| Freebies Modal | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-freebies-modal) |
| Update Profile | 1 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-update-profile-modal) |
| Update Email | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-update-email-modal) |
| Review Card | 6 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-review-card-modal) |
| Payment Modal | 2 | [Modals](./API_MODALS_DIALOGS_MAPPING.md#-payment-client-modal) |

*Data passed from parent

---

## 🎯 By Priority (Integration Phases)

### Phase 1: Essential (Must Have)
1. [Guest Auth](./API_DOCUMENTATION.md#1-guest-authentication)
2. [Token Refresh](./API_DOCUMENTATION.md#2-refresh-access-token)
3. [Get Stores](./API_DOCUMENTATION.md#11-get-tenant-stores)
4. [Get Categories](./API_DOCUMENTATION.md#12-get-store-categories)
5. [Get Product Details](./API_DOCUMENTATION.md#14-get-product-details)
6. [Add to Cart](./API_DOCUMENTATION.md#19-add-to-cart)
7. [Get Cart](./API_DOCUMENTATION.md#18-get-cart)
8. [Place Order](./API_DOCUMENTATION.md#30-checkout--place-order)
9. [Get Orders](./API_DOCUMENTATION.md#31-get-all-orders)

### Phase 2: Core Features
10. [Login/Signup](./API_DOCUMENTATION.md#authentication--token-management)
11. [Product Search](./API_DOCUMENTATION.md#product-apis)
12. [Address Management](./API_DOCUMENTATION.md#checkout--address)
13. [Get Product Reviews](./API_DOCUMENTATION.md#39-get-product-reviews)

### Phase 3: Enhanced
14. [Payment Integration](./API_DOCUMENTATION.md#payment-apis)
15. [Cancel Order](./API_DOCUMENTATION.md#34-cancel-order)
16. [Submit Reviews](./API_DOCUMENTATION.md#reviews--ratings)
17. [Reorder](./API_DOCUMENTATION.md#35-reorder)
18. [Profile Management](./API_DOCUMENTATION.md#user-profile)
19. [Wishlist](./API_DOCUMENTATION.md#wishlist)

### Phase 4: Optional
20. [Events](./API_DOCUMENTATION.md#events)
21. [Popular Products](./API_DOCUMENTATION.md#16-get-popular-products)
22. [Offers](./API_DOCUMENTATION.md#53-get-offers)
23. [About Us](./API_DOCUMENTATION.md#67-get-team-members-client)

---

## 📖 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| [README.md](./README.md) | Navigation hub | Start here |
| [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) | Visual guide | Need help navigating |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete reference | Need endpoint details |
| [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) | Cheat sheet | Quick lookup |
| [API_PAGES_MAPPING.md](./API_PAGES_MAPPING.md) | Screen guide | Building screens |
| [API_MODALS_DIALOGS_MAPPING.md](./API_MODALS_DIALOGS_MAPPING.md) | Modal guide | Building modals |
| **INDEX.md** (this file) | Quick index | Fast endpoint lookup |

---

## 🔗 Quick Links

- [Back to README](./README.md)
- [Documentation Map](./DOCUMENTATION_MAP.md)
- [Main Project README](../../README.md)

---

**Last Updated**: December 2024  
**Total Endpoints**: 67+  
**Documentation Coverage**: 100%

