# PlateAway API - Page-Wise Mapping

> **📚 Documentation Navigation**  
> **You are here**: Page-by-Page API Mapping  
> **See also**: [Complete API Docs](./API_DOCUMENTATION.md) | [Quick Reference](./API_QUICK_REFERENCE.md) | [Modal Mapping](./API_MODALS_DIALOGS_MAPPING.md) | [API Docs Home](./README.md)

This document maps all API endpoints to the specific pages/screens where they are used in the PlateAway application.

---

## 📑 Table of Contents

1. [General / Global APIs](#1-general--global-apis)
2. [Homepage](#2-homepage)
3. [Store/Menu Page](#3-storemenu-page)
4. [Product Listing Page (PLP / Category)](#4-product-listing-page-plp--category)
5. [Product Detail Page (PDP)](#5-product-detail-page-pdp)
6. [Cart Page](#6-cart-page)
7. [Checkout Page](#7-checkout-page)
8. [Orders Page (Order History)](#8-orders-page-order-history)
9. [Order Details Page](#9-order-details-page)
10. [Wishlist Page](#10-wishlist-page)
11. [Profile/Edit Profile Page](#11-profileedit-profile-page)
12. [Events Page](#12-events-page)
13. [About Us Page](#13-about-us-page)
14. [Payment Page](#14-payment-page)
15. [Review/Rating Modals](#15-reviewrating-modals)
16. [Search Functionality](#16-search-functionality)
17. [Header/Navigation](#17-headernavigation)

---

## 1. General / Global APIs

These APIs are called across multiple pages or during app initialization. They handle authentication, session management, and global configuration.

### 🔐 Authentication & Session Management

#### **Guest Authentication** (App Launch)
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/guest-auth`
- **When Called**: 
  - App initialization (first launch)
  - When no valid token exists
  - After token refresh fails
- **Purpose**: Generate initial access token for unauthenticated users
- **Used In**: `services/guestToken.ts`, Axios interceptor
- **Request**:
  ```json
  {
    "fingerprintId": "unique-device-fingerprint"
  }
  ```
- **Response**: Access token + Refresh token + Client name

---

#### **Refresh Access Token** (Token Expiry)
- **Endpoint**: `GET /e-commerce/v1/refreshToken`
- **When Called**: 
  - Automatically on 401/406 errors
  - Before token expiry (background refresh)
- **Purpose**: Get new access token using refresh token
- **Used In**: `services/axios.ts` (interceptor)
- **Headers Required**:
  ```json
  {
    "ClientName": "stored-client-name",
    "Authorization": "REFRESH_TOKEN"
  }
  ```

---

#### **Login - Request OTP**
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/loginWithOtp`
- **When Called**: User clicks "Login with Email"
- **Used In**: Login modal (`components/header/login.tsx`)
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "otpType": "email"
  }
  ```

---

#### **Login - Verify OTP**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer/loginWithOtp`
- **When Called**: User enters OTP code
- **Used In**: Verify OTP modal (`components/dialogDrawer/modal/verifyOtpModal.tsx`)
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "otpType": "email"
  }
  ```

---

#### **Signup**
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/signup`
- **When Called**: User completes registration form
- **Used In**: Signup modal (`components/dialogDrawer/modal/signupModal.tsx`)
- **Request**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "countryCode": "+1",
    "phone": "1234567890",
    "phoneIsoCode": "US"
  }
  ```

---

#### **Validate Phone Number**
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/validate/phone`
- **When Called**: During signup, when user enters phone number
- **Used In**: Signup flow (`hooks/usePhoneValidation.ts`)
- **Purpose**: Check if phone number is already registered

---

#### **Google OAuth Login**
- **Endpoint**: `POST /e-commerce/v1/googleAuth/food`
- **When Called**: User clicks "Continue with Google"
- **Used In**: Login modal (`hooks/useGoogleAuth.ts`)
- **Request**:
  ```json
  {
    "code": "google_auth_code"
  }
  ```

---

#### **Token Exchange**
- **Endpoint**: `GET /e-commerce/v1/tenant/customer/tokenExchange?storefrontId={id}`
- **When Called**: When switching between stores
- **Purpose**: Get store-specific access token
- **Used In**: Store selection logic

---

#### **Logout**
- **Endpoint**: `POST /e-commerce/v1/logout`
- **When Called**: User clicks logout button
- **Used In**: User profile menu (`components/header/userProfileMenu.tsx`)
- **Headers Required**:
  ```json
  {
    "ClientName": "stored-client-name",
    "Authorization": "REFRESH_TOKEN"
  }
  ```

---

### 🌍 Location Services (External APIs)

#### **Get IP-Based Location**
- **Endpoint**: `GET https://ipapi.co/json/`
- **When Called**: 
  - App initialization
  - When geolocation permission denied
- **Purpose**: Fallback location detection
- **Used In**: `lib/utils/location.ts`

---

#### **Get Address from Coordinates** (Reverse Geocoding)
- **Endpoint**: `GET https://nominatim.openstreetmap.org/reverse`
- **When Called**: 
  - When user selects location on map
  - After getting device GPS coordinates
- **Used In**: Address selection, checkout

---

#### **Search Address**
- **Endpoint**: `GET https://nominatim.openstreetmap.org/search`
- **When Called**: User types in address search box
- **Used In**: Checkout address entry

---

## 2. Homepage

**Page Location**: `app/page.tsx`

### APIs Called on Homepage:

#### **Get Page Configuration**
- **Endpoint**: `GET /e-commerce/v1/tenant/config?pageType=HOME`
- **When Called**: Page load (Server-side)
- **Purpose**: Get homepage SEO, theme, and basic config
- **Used In**: `app/page.tsx`, `services/homePage.ts`

---

#### **Get Page Draft/Content**
- **Endpoint**: `GET /e-commerce/v1/pages?pageSlug=home&isDraft=true`
- **When Called**: Page load (Server-side)
- **Purpose**: Get CMS content for homepage (sections, banners, etc.)
- **Used In**: `app/page.tsx`
- **Response**: Puck CMS data structure

---

#### **Get Stores (VisitUs Section)**
- **Endpoint**: `GET /e-commerce/v1/tenant/store`
- **Query Parameters**:
  ```
  latitude=40.7128
  longitude=-74.0060
  timezone=America/New_York
  ```
- **When Called**: If homepage has "VisitUs" section
- **Purpose**: Show nearby stores with distance
- **Used In**: Homepage VisitUs section

---

#### **Get Customer Reviews/Testimonials**
- **Endpoint**: `GET /reviews-svc/v1/reviews/storeReview`
- **When Called**: If homepage has "Testimonials" section
- **Purpose**: Display featured customer testimonials
- **Used In**: Homepage Testimonials section (`pageEditor/components/TestimonialsSection`)
- **Cache**: 5 minutes client-side

---

#### **Get Popular Products**
- **Endpoint**: `GET /e-commerce/v1/tenant/product/popular-products`
- **When Called**: If homepage has "Popular Items" section
- **Purpose**: Display trending/popular products
- **Used In**: Homepage Popular Items section (`pageEditor/components/PopularItems`)

---

## 3. Store/Menu Page

**Page Location**: `app/[storeSlug]/[menuSlug]/page.tsx`

### APIs Called on Store/Menu Page:

#### **Get Store Page Data**
- **Endpoint**: `GET /e-commerce/v1/tenant/config`
- **Query Parameters**:
  ```
  pageType=STORE
  storeSlug=downtown-branch
  ```
- **When Called**: Page load (Server-side)
- **Purpose**: Get store details, SEO, configuration
- **Used In**: `app/[storeSlug]/[menuSlug]/page.tsx`

---

#### **Get Store Categories**
- **Endpoint**: `GET /e-commerce/v1/tenant/menu/categories`
- **Query Parameters**:
  ```
  menuSlug=lunch-menu
  storeSlug=downtown-branch
  ```
- **When Called**: Page load and menu selection
- **Purpose**: Get menu categories for navigation
- **Used In**: Store menu component (`hooks/storepage/useCategories.ts`)
- **Cache**: Request deduplication

---

#### **Get Cart**
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Page load
  - After any cart operation
- **Purpose**: Display current cart count in header
- **Used In**: Cart button, header

---

## 4. Product Listing Page (PLP / Category)

**Page Location**: `app/[storeSlug]/[menuSlug]/[categorySlug]/page.tsx`

### APIs Called on PLP:

#### **Get Category Page Config**
- **Endpoint**: `GET /e-commerce/v1/tenant/config`
- **Query Parameters**:
  ```
  pageType=PRODUCTS
  storeSlug=downtown-branch
  categorySlug=appetizers
  ```
- **When Called**: Page load (Server-side)
- **Purpose**: Get category SEO, title, description
- **Used In**: `app/[storeSlug]/[menuSlug]/[categorySlug]/page.tsx`
- **Cache**: 5 minutes

---

#### **Search Products** (TypeSense)
- **Service**: TypeSense (Client-side search)
- **When Called**: 
  - Page load
  - Filter changes
  - Sort changes
  - Search query
- **Purpose**: Get filtered/sorted product list
- **Used In**: Product listing component (`hooks/products/usetypesenseproducts.ts`)
- **Parameters**:
  ```javascript
  {
    q: "burger",
    query_by: "name,description",
    filter_by: "categoryId:=cat_id && isAvailable:=true",
    sort_by: "basePrice:asc",
    page: 1,
    per_page: 20,
    facet_by: "categoryId,brandName"
  }
  ```

---

#### **Get Offers**
- **Endpoint**: `GET /e-commerce/v1/tenant/offer`
- **Query Parameters**:
  ```
  storeSlug=downtown-branch
  categorySlug=appetizers
  menuSlug=lunch-menu
  ```
- **When Called**: Page load
- **Purpose**: Display active offers/promotions for category
- **Used In**: Product listing page

---

#### **Get Recent Searches**
- **Endpoint**: `GET /e-commerce/v1/tenant/recentSearch`
- **Headers**: `Store-Id: store_id`
- **Query Parameters**:
  ```
  skip=0
  limit=10
  menuId=menu_id
  ```
- **When Called**: User opens search box
- **Purpose**: Show user's recent search history
- **Used In**: Search functionality (`hooks/storepage/useRecentSearch.ts`)

---

#### **Add to Wishlist** (from PLP)
- **Endpoint**: `POST /e-commerce/v1/tenant/wishlist`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User clicks wishlist icon on product card
- **Request**: `{ "productId": "product_id" }`
- **Used In**: Product card wishlist button

---

## 5. Product Detail Page (PDP)

**Page Location**: `app/[storeSlug]/[menuSlug]/[categorySlug]/[productSlug]/page.tsx`

### APIs Called on PDP:

#### **Get Product Details**
- **Endpoint**: `GET /e-commerce/v1/tenant/product`
- **Query Parameters**:
  ```
  categorySlug=appetizers
  productSlug=deluxe-burger
  storeSlug=downtown-branch
  ```
- **Headers**: `X-User-Location: {...}`
- **When Called**: Page load (Server-side + Client-side)
- **Purpose**: Get complete product info (variants, modifiers, pricing, etc.)
- **Used In**: `lib/cache.ts` (getCachedProductDetails)
- **Cache**: LRU cache with 10-minute TTL

---

#### **Get Combo Product Details**
- **Endpoint**: `GET /e-commerce/v1/tenant/product`
- **Query Parameters**:
  ```
  categoryId=cat_id
  productSlug=combo-meal
  storeSlug=downtown-branch
  ```
- **When Called**: For combo/meal products
- **Purpose**: Get combo groups and options
- **Used In**: Combo flow (`services/combo.ts`)

---

#### **Get Product Reviews**
- **Endpoint**: `GET /reviews-svc/v1/reviews`
- **Query Parameters**:
  ```
  product_id=product_id
  page=1
  limit=10
  is_product_review=1
  ```
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Reviews tab clicked
  - Page load (if reviews visible)
- **Purpose**: Display product reviews and ratings
- **Used In**: `hooks/useGetProductReviews.ts`

---

#### **Add to Cart** (Simple Product)
- **Endpoint**: `POST /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User clicks "Add to Cart"
- **Request**:
  ```json
  {
    "productId": "product_id",
    "variantId": "variant_id",
    "quantity": 2,
    "specialInstructions": "No onions",
    "modifierGroups": [
      {
        "modifierGroupId": "group_id",
        "modifiers": [
          {
            "modifierId": "modifier_id",
            "quantity": 1
          }
        ]
      }
    ]
  }
  ```
- **Used In**: PDP add to cart button, quantity controls

---

#### **Add to Cart** (Combo Product)
- **Endpoint**: `POST /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User completes combo customization
- **Request**:
  ```json
  {
    "quantity": 1,
    "productId": "combo_id",
    "comboPrimaryProductId": "main_product_id",
    "comboPrimaryProductVariantId": "variant_id",
    "comboPrimaryProductModifierGroups": [...],
    "comboProducts": [
      {
        "groupName": "Side",
        "productId": "side_id",
        "variantId": "side_variant_id",
        "modifierGroups": [...]
      }
    ]
  }
  ```
- **Used In**: Combo flow (`components/products/ComboFlow.tsx`)

---

#### **Get Product Stores**
- **Endpoint**: `GET /e-commerce/v1/tenant/product/getStores?productId={id}`
- **When Called**: User clicks "View availability"
- **Purpose**: Show which stores have this product
- **Used In**: PDP availability section

---

#### **Add to Wishlist**
- **Endpoint**: `POST /e-commerce/v1/tenant/wishlist`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User clicks wishlist heart icon
- **Request**: `{ "productId": "product_id" }`
- **Used In**: PDP wishlist button (`hooks/useWishlist.ts`)

---

#### **Remove from Wishlist**
- **Endpoint**: `DELETE /e-commerce/v1/tenant/wishlist?productId={id}`
- **Headers**: `Store-Id: store_id`
- **When Called**: User clicks wishlist icon again (toggle off)
- **Used In**: PDP wishlist button

---

## 6. Cart Page

**Page Location**: `app/[storeSlug]/cart/page.tsx`

### APIs Called on Cart Page:

#### **Get Cart**
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Page load
  - After cart updates
- **Purpose**: Display cart items, totals, applied offers
- **Used In**: `components/order/MyOrder.tsx`

---

#### **Update Cart Item Quantity**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User changes item quantity
- **Request**:
  ```json
  {
    "id": "cart_item_id",
    "quantity": 3
  }
  ```
- **Used In**: Quantity controls (`hooks/useQuantityControls.ts`)

---

#### **Update Cart Item (Special Instructions)**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User adds/edits special instructions
- **Request**:
  ```json
  {
    "id": "cart_item_id",
    "specialInstructions": "Extra spicy"
  }
  ```
- **Used In**: Instructions modal

---

#### **Get Upsell Products**
- **Endpoint**: `GET /e-commerce/v1/tenant/cart/upsell-products?cartItemIds=id1,id2`
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - After adding item to cart
  - Cart page load
- **Purpose**: Show recommended add-ons
- **Used In**: Cart addons section (`components/order/AddOnList.tsx`)

---

#### **Get Freebie Offers**
- **Endpoint**: `GET /e-commerce/v1/tenant/cart/freebie-offer`
- **Query Parameters**:
  ```
  cartId=cart_id
  offerId=offer_id
  ```
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Cart page load
  - After cart updates
- **Purpose**: Show available freebies based on cart value
- **Used In**: Freebies modal (`hooks/useFreebiesOffer.ts`)

---

#### **Apply Promo Code**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User enters and applies promo code
- **Request**:
  ```json
  {
    "promoCode": "SAVE10"
  }
  ```
- **Used In**: Discount code input (`components/order/DiscountCodeInput.tsx`)

---

#### **Get Promotions List**
- **Endpoint**: `GET /promo-svc/v1/user/promotions/list?cart_id={id}`
- **When Called**: User clicks "View available coupons"
- **Purpose**: Show all applicable promo codes
- **Used In**: Discount coupons modal

---

## 7. Checkout Page

**Page Location**: `app/[storeSlug]/checkout/page.tsx`

### APIs Called on Checkout:

#### **Get Cart** (Checkout)
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When Called**: Page load
- **Purpose**: Display order summary
- **Used In**: `components/checkOut/CheckOutFront.tsx`

---

#### **Get Customer Addresses**
- **Endpoint**: `GET /e-commerce/v1/tenant/customer/address`
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Checkout page load
  - Delivery option selected
- **Purpose**: Show saved delivery addresses
- **Used In**: `hooks/useAddress.ts`

---

#### **Add Customer Address**
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/address`
- **Headers**: `Store-Id: store_id`
- **When Called**: User adds new delivery address
- **Request**:
  ```json
  {
    "addressType": "home",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "isDefault": true,
    "deliveryInstructions": "Ring doorbell"
  }
  ```
- **Used In**: Add address modal (`components/dialogDrawer/modal/Address/AddAddressModal.tsx`)

---

#### **Update Customer Address**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer/address`
- **Headers**: `Store-Id: store_id`
- **When Called**: User edits saved address
- **Request**: Same as add, with `id` field
- **Used In**: Address edit modal

---

#### **Delete Customer Address**
- **Endpoint**: `DELETE /e-commerce/v1/tenant/customer/address?id={address_id}`
- **Headers**: `Store-Id: store_id`
- **When Called**: User deletes saved address
- **Used In**: Address card delete button

---

#### **Calculate Delivery Fee**
- **Endpoint**: `GET /e-commerce/v1/tenant/order/calculateDeliveryFee`
- **Query Parameters**:
  ```
  cartId=cart_id
  deliveryAddressLat=40.7128
  deliveryAddressLng=-74.0060
  ```
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - User selects delivery address
  - Address changes
- **Purpose**: Calculate delivery fee and estimated time
- **Used In**: Checkout delivery section (`hooks/useCheckout.ts`)

---

#### **Get Promotions List** (Checkout)
- **Endpoint**: `GET /promo-svc/v1/user/promotions/list?cart_id={id}`
- **When Called**: Checkout page load
- **Purpose**: Show available coupons on checkout
- **Used In**: Checkout promo section

---

#### **Place Order** (Checkout)
- **Endpoint**: `POST /e-commerce/v1/tenant/order`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User confirms and places order
- **Request**:
  ```json
  {
    "cartId": "cart_id",
    "orderType": "delivery",
    "paymentMethod": "card",
    "deliveryAddress": {
      "id": "address_id"
    },
    "scheduledTime": "2024-12-05T18:00:00Z",
    "customerNotes": "Please call on arrival",
    "promoCode": "SAVE10",
    "tipAmount": 5.00,
    "contactPhone": "+1234567890",
    "contactEmail": "user@example.com"
  }
  ```
- **Used In**: Checkout confirm button (`hooks/useCheckout.ts`)
- **Response**: Order ID, payment intent (if required)

---

## 8. Orders Page (Order History)

**Page Location**: `app/orders/page.tsx`

### APIs Called on Orders Page:

#### **Get All Orders**
- **Endpoint**: `GET /e-commerce/v1/tenant/order`
- **Headers**: `Tenant-Id: tenant_id`
- **Query Parameters**:
  ```
  status=completed (optional)
  q=ORD-12345 (optional search)
  timeFilter=LAST_7_DAYS (optional)
  startDate=1638316800000 (if CUSTOM_DATE)
  endDate=1638403200000 (if CUSTOM_DATE)
  ```
- **When Called**: 
  - Page load
  - Filter changes
  - Search query
  - Time filter changes
- **Purpose**: Display user's order history
- **Used In**: `hooks/useGetAllOrder.ts`

---

#### **Post Recent Search** (Orders Search)
- **Endpoint**: `POST /e-commerce/v1/tenant/recentSearch`
- **Headers**: `Store-Id: store_id`
- **When Called**: User searches for orders
- **Request**:
  ```json
  {
    "searchQuery": "ORD-12345"
  }
  ```
- **Used In**: Orders search box

---

## 9. Order Details Page

**Page Location**: `app/orders/[id]/page.tsx`

### APIs Called on Order Details:

#### **Get Order by ID**
- **Endpoint**: `GET /e-commerce/v1/tenant/order?orderId={order_id}`
- **When Called**: Page load
- **Purpose**: Get detailed order information with status history
- **Used In**: Order details container (`app/orders/OrderDetailsContainer.tsx`)

---

#### **Get Order Cancel Reasons**
- **Endpoint**: `GET /e-commerce/v1/cancellation/reason?isStoreReason=false`
- **When Called**: User clicks "Cancel Order"
- **Purpose**: Show cancellation reason options
- **Used In**: Cancel popup (`app/orders/CancelPopup.tsx`)

---

#### **Cancel Order**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/order/cancel`
- **Headers**: `Store-Id: store_id`
- **When Called**: User confirms order cancellation
- **Request**:
  ```json
  {
    "orderId": "order_id",
    "reasonId": "reason_id"
  }
  ```
- **Used In**: Cancel order confirmation

---

#### **Get Reorder Products**
- **Endpoint**: `GET /e-commerce/v1/tenant/order/reorder`
- **Query Parameters**:
  ```
  storeSlug=downtown-branch
  menuSlug=lunch-menu
  ```
- **When Called**: 
  - User clicks "Reorder" button
  - Order again section loads
- **Purpose**: Get previously ordered products for quick reorder
- **Used In**: Order again component (`hooks/useReorderProducts.ts`)

---

#### **Get Product Parameters** (for review)
- **Endpoint**: `GET /reviews-svc/v1/reviews/productParameter`
- **When Called**: User clicks "Write Review" on delivered order
- **Purpose**: Get review criteria/parameters
- **Used In**: Review modal setup

---

#### **Get Order Reviews**
- **Endpoint**: `GET /reviews-svc/v1/reviews`
- **Query Parameters**:
  ```
  order_id=order_id
  page=1
  limit=10
  status=active
  is_product_review=1
  ```
- **When Called**: Order details page with review option
- **Purpose**: Check if user already reviewed this order
- **Used In**: `hooks/useOrderReviews.ts`

---

#### **Submit Product Review**
- **Endpoint**: `POST /reviews-svc/v1/reviews`
- **Headers**: `Store-Id: store_id`
- **When Called**: User submits product review from order
- **Request**:
  ```json
  {
    "product_id": "product_id",
    "order_id": "order_id",
    "overall_rating": 4.5,
    "title": "Great product!",
    "content": "Really enjoyed this",
    "parameterRatings": [
      {
        "parameterId": "param_id",
        "parameterName": "Taste",
        "rating": 5
      }
    ],
    "images": ["image_url"]
  }
  ```
- **Used In**: Review modal (`app/orders/ReviewModal.tsx`)

---

#### **Get Store Parameters** (for store review)
- **Endpoint**: `GET /reviews-svc/v1/reviews/storeParameter`
- **When Called**: User clicks "Review Store" from order
- **Purpose**: Get store review criteria

---

#### **Submit Store Review**
- **Endpoint**: `POST /reviews-svc/v1/reviews/storeReview`
- **Headers**: `Store-Id: store_id`
- **When Called**: User submits store review
- **Request**:
  ```json
  {
    "order_id": "order_id",
    "overall_rating": 4.5,
    "title": "Great experience",
    "content": "Excellent service",
    "parameterRatings": [
      {
        "parameterId": "param_id",
        "parameterName": "Service",
        "rating": 5
      }
    ]
  }
  ```
- **Used In**: Store review modal

---

## 10. Wishlist Page

**Page Location**: `app/[storeSlug]/[menuSlug]/wishlist/page.tsx`

### APIs Called on Wishlist:

#### **Get Wishlist**
- **Endpoint**: `GET /e-commerce/v1/tenant/wishlist`
- **Headers**: `Store-Id: store_id`
- **Query Parameters**:
  ```
  limit=20 (optional)
  offset=0 (optional)
  ```
- **When Called**: Page load
- **Purpose**: Display all wishlisted products
- **Used In**: `components/wishlist/WishlistListing.tsx`

---

#### **Remove from Wishlist**
- **Endpoint**: `DELETE /e-commerce/v1/tenant/wishlist?productId={id}`
- **Headers**: `Store-Id: store_id`
- **When Called**: User clicks remove/heart icon
- **Used In**: Wishlist item remove button

---

#### **Add to Cart from Wishlist**
- **Endpoint**: `POST /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`, `X-User-Location: {...}`
- **When Called**: User clicks "Add to Cart" on wishlist item
- **Request**: Product + variant + quantity
- **Used In**: Wishlist add to cart button

---

## 11. Profile/Edit Profile Page

**Page Location**: `app/editProfile/page.tsx`

### APIs Called on Profile Page:

#### **Update Profile**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer`
- **When Called**: User updates name, phone, etc.
- **Request**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "1234567890",
    "countryCode": "+1",
    "phoneIsoCode": "US"
  }
  ```
- **Used In**: Edit profile modal (`components/dialogDrawer/modal/EditProfile/UpdateProfileModal.tsx`)

---

#### **Request Email Update (Send OTP)**
- **Endpoint**: `GET /e-commerce/v1/tenant/customer/update/email?email={new_email}`
- **When Called**: User initiates email change
- **Purpose**: Send OTP to new email
- **Used In**: Update email component (`components/editprofile/UpdateEmail.tsx`)

---

#### **Verify Email Update (Confirm OTP)**
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer`
- **When Called**: User enters OTP for email change
- **Request**:
  ```json
  {
    "email": "newemail@example.com",
    "otp": "123456"
  }
  ```
- **Used In**: Update email OTP verification

---

#### **Get Presigned URL** (Profile Picture Upload)
- **Endpoint**: `POST /e-commerce/v1/upload/multiple`
- **When Called**: User uploads profile picture
- **Request**:
  ```json
  {
    "files": [
      {
        "fileName": "profile-pic.jpg",
        "fileType": "image/jpeg",
        "fileSize": 102400
      }
    ],
    "uploadType": "profile"
  }
  ```
- **Used In**: Profile picture uploader (`components/uppy/UppyMediaUpload.tsx`)

---

## 12. Events Page

**Page Location**: `app/events/page.tsx`

### APIs Called on Events Page:

#### **Get Events**
- **Endpoint**: `GET /e-commerce/v1/tenant/event`
- **When Called**: Page load
- **Purpose**: Display all active events/promotions
- **Used In**: `hooks/useEvents.ts`

---

#### **Get Event Details**
- **Endpoint**: `GET /e-commerce/v1/tenant/event?id={event_id}`
- **When Called**: User clicks on specific event
- **Purpose**: Show detailed event information
- **Used In**: Event details page (`hooks/useEventDetails.ts`)

---

## 13. About Us Page

**Page Location**: `app/about-us/page.tsx`

### APIs Called on About Us:

#### **Get Page Draft** (About Us Content)
- **Endpoint**: `GET /e-commerce/v1/pages?pageSlug=about-us&isDraft=true`
- **When Called**: Page load (Server-side)
- **Purpose**: Get CMS content for About Us page
- **Used In**: `app/about-us/page.tsx`

---

#### **Get Team Members**
- **Endpoint**: `GET /e-commerce/v1/teamMembers`
- **When Called**: If About Us page has "Meet Our Team" section
- **Purpose**: Display team member profiles
- **Used In**: About Us server component
- **Response**: Team member data (204 if no data)

---

## 14. Payment Page

**Page Location**: `app/payment/[orderId]/page.tsx`

### APIs Called on Payment:

#### **Create Payment Intent**
- **Endpoint**: `POST /integration-svc/v1/payments/intent`
- **Headers**: `Store-Id: store_id`
- **When Called**: Payment page loads
- **Request**:
  ```json
  {
    "orderId": "order_id"
  }
  ```
- **Purpose**: Initialize Stripe payment
- **Used In**: `hooks/usePayment.ts`
- **Response**: 
  ```json
  {
    "client_secret": "pi_xxx_secret_yyy",
    "amount": 2810,
    "customerSessionClientSecret": "cus_session_xxx"
  }
  ```

---

#### **Payment Webhook** (Confirmation)
- **Endpoint**: `POST /e-commerce/v1/payments/webhook`
- **When Called**: After payment completion (by payment provider)
- **Purpose**: Update order payment status
- **Request**:
  ```json
  {
    "orderId": "order_id",
    "paymentIntentId": "pi_xxx",
    "status": "succeeded",
    "amount": 2810,
    "currency": "usd"
  }
  ```

---

## 15. Review/Rating Modals

### APIs Called in Review Modals:

#### **Get Product Reviews** (View Reviews)
- **Endpoint**: `GET /reviews-svc/v1/reviews`
- **Query Parameters**:
  ```
  product_id=product_id
  page=1
  limit=10
  is_product_review=1
  status=active
  ```
- **When Called**: User views product reviews
- **Used In**: Product reviews modal/tab

---

#### **Get Store Reviews**
- **Endpoint**: `GET /reviews-svc/v1/reviews/storeReview/store`
- **Query Parameters**:
  ```
  limit=10
  skip=0
  ```
- **Headers**: `Store-Id: store_id`
- **When Called**: Store reviews section loads
- **Used In**: Store reviews display

---

#### **Submit Review with Images**
Flow:
1. **Get Upload URLs**:
   - `POST /e-commerce/v1/upload/multiple`
   - Request: File info for review images
   
2. **Upload to S3**:
   - Direct PUT to presigned URL
   
3. **Submit Review**:
   - `POST /reviews-svc/v1/reviews`
   - Include uploaded image URLs in request

---

## 16. Search Functionality

### APIs Called in Search:

#### **Post Recent Search**
- **Endpoint**: `POST /e-commerce/v1/tenant/recentSearch`
- **Headers**: `Store-Id: store_id`
- **When Called**: User performs a search
- **Request**:
  ```json
  {
    "searchQuery": "burger",
    "menuId": "menu_id"
  }
  ```
- **Used In**: Search component (`hooks/storepage/useRecentSearch.ts`)

---

#### **Get Recent Search Suggestions**
- **Endpoint**: `GET /e-commerce/v1/tenant/recentSearch`
- **Headers**: `Store-Id: store_id`
- **Query Parameters**:
  ```
  skip=0
  limit=10
  menuId=menu_id
  ```
- **When Called**: User focuses on search input
- **Purpose**: Show recent searches
- **Used In**: Search dropdown

---

#### **Delete Recent Search**
- **Endpoint**: `DELETE /e-commerce/v1/tenant/recentSearch?id={search_id}`
- **Headers**: `Store-Id: store_id`
- **When Called**: User clicks X on recent search item
- **Used In**: Recent search item

---

#### **Search Products** (TypeSense)
- **When Called**: User types in search box
- **Purpose**: Real-time product search
- **Used In**: Search results component

---

## 17. Header/Navigation

### APIs Called in Header:

#### **Get Cart** (Cart Icon Badge)
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When Called**: 
  - Page load
  - After cart operations
  - Periodic refresh
- **Purpose**: Display cart item count
- **Used In**: Cart button (`components/buttons/CartButton.tsx`)

---

#### **Get Store Reviews** (Store Rating in Header)
- **Endpoint**: `GET /reviews-svc/v1/reviews/storeReview/store`
- **Headers**: `Store-Id: store_id`
- **When Called**: Store page load
- **Purpose**: Display store rating in header
- **Used In**: Store header component

---

#### **Login APIs** (from Header Login Button)
- All authentication APIs listed in Section 1
- Triggered from header login modal

---

## 📊 API Call Summary by Page

| Page | # of APIs | Most Critical API |
|------|-----------|-------------------|
| **General/Global** | 9 | Guest Auth, Token Refresh |
| **Homepage** | 5 | Get Page Config, Get Stores |
| **Store/Menu** | 3 | Get Store Data, Get Categories |
| **PLP (Category)** | 5 | TypeSense Search, Get Offers |
| **PDP (Product)** | 8 | Get Product Details, Add to Cart |
| **Cart** | 6 | Get Cart, Update Cart, Get Upsell |
| **Checkout** | 8 | Place Order, Calculate Delivery Fee |
| **Orders** | 2 | Get All Orders |
| **Order Details** | 7 | Get Order by ID, Cancel Order |
| **Wishlist** | 3 | Get Wishlist, Remove from Wishlist |
| **Profile** | 4 | Update Profile, Update Email |
| **Events** | 2 | Get Events, Get Event Details |
| **About Us** | 2 | Get Page Draft, Get Team Members |
| **Payment** | 2 | Create Payment Intent, Webhook |
| **Reviews** | 6 | Get/Submit Product/Store Reviews |
| **Search** | 4 | Recent Search CRUD, TypeSense |

---

## 🔄 API Call Flow Examples

### Complete Order Flow:
```
1. Homepage → Get Page Config, Get Stores
2. Select Store → Get Store Data, Get Categories
3. Browse Category → TypeSense Search Products
4. View Product → Get Product Details
5. Add to Cart → POST Cart, Get Upsell Products
6. View Cart → Get Cart, Get Freebies
7. Checkout → Get Addresses, Calculate Delivery Fee
8. Place Order → POST Order
9. Payment → Create Payment Intent
10. Track Order → Get Order by ID
11. Review → Submit Review
```

### User Registration Flow:
```
1. App Launch → Guest Auth
2. Click Sign Up → Validate Phone
3. Submit Form → POST Signup
4. Success → Login automatically (token returned)
```

### Search Flow:
```
1. Click Search → Get Recent Searches
2. Type Query → TypeSense Search (real-time)
3. Submit → POST Recent Search
4. View Results → Display Products
```

---

## 🎯 Integration Priority for Mobile

### Phase 1 - Essential (Must Have):
1. Guest Authentication
2. Token Refresh
3. Get Stores
4. Get Categories  
5. Get Product Details
6. Add to Cart
7. Get Cart
8. Place Order
9. Get All Orders

### Phase 2 - Core Features:
10. Login/Signup
11. Product Search (TypeSense)
12. Get Customer Addresses
13. Add/Update Address
14. Calculate Delivery Fee
15. Get Product Reviews
16. Wishlist CRUD

### Phase 3 - Enhanced Features:
17. Payment Integration
18. Cancel Order
19. Submit Reviews
20. Reorder
21. Profile Management
22. Recent Searches
23. Upsell/Freebies

### Phase 4 - Optional/Nice to Have:
24. Events
25. About Us
26. Team Members
27. Popular Products
28. Store Reviews
29. Upload Images

---

## 📝 Notes for Mobile Developers

1. **Store-Id Header**: Required for almost all store-specific operations. Store this after store selection.

2. **X-User-Location Header**: Required for write operations (POST/PATCH). Build this from device location + user info.

3. **Token Management**: Implement auto-refresh logic. Web uses axios interceptor - mobile should implement similar.

4. **Caching**: Implement client-side caching for:
   - Page configs (5-15 min)
   - Product details (10 min)
   - Categories (10 min)
   - Cart (no cache - always fresh)

5. **TypeSense**: Can use TypeSense mobile SDK or fall back to regular product APIs.

6. **Request Deduplication**: Prevent duplicate concurrent requests for same endpoint.

7. **Error Handling**:
   - 401/406 → Refresh token
   - 403 → Clear tokens, re-authenticate
   - 204 → Valid response, no content (not an error)

8. **File Uploads**: Always use presigned URL flow (not direct upload).

---

*Last Updated: December 2024*  
*Total Unique Endpoints: 67+*  
*External Services: 4 (OpenStreetMap, IPInfo, IPApi, TypeSense)*

