# PlateAway API - Modals/Dialogs Mapping

> **📚 Documentation Navigation**  
> **You are here**: Modal/Dialog API Reference  
> **See also**: [Complete API Docs](./API_DOCUMENTATION.md) | [Quick Reference](./API_QUICK_REFERENCE.md) | [Page Mapping](./API_PAGES_MAPPING.md) | [API Docs Home](./README.md)

This document details all modals/dialogs in the application, where they open from, what triggers them, and which APIs they call.

---

## 📑 Table of Contents

1. [Authentication Modals](#1-authentication-modals)
2. [Cart & Product Modals](#2-cart--product-modals)
3. [Checkout & Address Modals](#3-checkout--address-modals)
4. [Order Modals](#4-order-modals)
5. [Profile & Account Modals](#5-profile--account-modals)
6. [Review & Rating Modals](#6-review--rating-modals)
7. [Informational Modals](#7-informational-modals)
8. [Payment Modals](#8-payment-modals)

---

## 1. Authentication Modals

### 🔐 Login Modal
**Component**: `components/dialogDrawer/modal/loginModal.tsx`

**Opens From**:
- Header "Login" button (all pages)
- Cart page (when guest tries to checkout)
- Wishlist page (when guest tries to add to wishlist)
- Any protected action by guest user

**Trigger**: User clicks login/sign in button or attempts protected action

**Purpose**: Email-based login with OTP

**APIs Called**:

#### 1. Request Login OTP
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/loginWithOtp`
- **When**: User enters email and clicks "Send OTP"
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "otpType": "email"
  }
  ```
- **Headers**: 
  ```json
  {
    "Tenant-Id": "tenant_id",
    "X-User-Location": "{...location data...}"
  }
  ```

#### 2. Google OAuth (Alternative)
- **Endpoint**: `POST /e-commerce/v1/googleAuth/food`
- **When**: User clicks "Continue with Google"
- **Hook**: `hooks/useGoogleAuth.ts`
- **Request**:
  ```json
  {
    "code": "google_auth_code"
  }
  ```

**Next Action**: Opens Verify OTP Modal on success

---

### ✅ Verify OTP Modal
**Component**: `components/dialogDrawer/modal/verifyOtpModal.tsx`

**Opens From**: 
- Login Modal (after OTP sent)
- Update Email flow (from profile)

**Trigger**: After login OTP is sent to email

**Purpose**: Verify OTP and complete login

**APIs Called**:

#### 1. Verify Login OTP
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer/loginWithOtp`
- **When**: User enters 6-digit OTP code
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "otpType": "email"
  }
  ```
- **Headers**:
  ```json
  {
    "Tenant-Id": "tenant_id",
    "Authorization": "GUEST_TOKEN",
    "X-User-Location": "{...location data...}"
  }
  ```
- **Response**: User access token + refresh token

**Success Action**: 
- Stores tokens
- Closes modal
- Refreshes current page
- Updates user session

---

### 📝 Signup Modal
**Component**: `components/dialogDrawer/modal/signupModal.tsx`

**Opens From**: 
- Login Modal (when user clicks "Create Account")
- Header (new user registration link)

**Trigger**: User clicks signup/create account

**Purpose**: User registration

**APIs Called**:

#### 1. Validate Phone Number
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/validate/phone`
- **When**: User types phone number (debounced)
- **Hook**: `hooks/usePhoneValidation.ts`
- **Request**:
  ```json
  {
    "phone": "1234567890",
    "countryCode": "+1",
    "phoneIsoCode": "US",
    "email": "user@example.com"
  }
  ```
- **Purpose**: Check if phone already registered, real-time validation

#### 2. Create Account (Signup)
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/signup`
- **When**: User submits registration form
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
- **Headers**:
  ```json
  {
    "Tenant-Id": "tenant_id",
    "X-User-Location": "{...location data...}"
  }
  ```

**Success Action**: 
- Automatically logs in user (returns tokens)
- Closes modal
- Redirects to homepage or previous page

---

### 🚪 Logout Modal
**Component**: `components/dialogDrawer/modal/LogoutModal.tsx`

**Opens From**: 
- User profile menu (header)
- Profile drawer (mobile)

**Trigger**: User clicks logout button

**Purpose**: Confirm logout action

**APIs Called**:

#### 1. Logout
- **Endpoint**: `POST /e-commerce/v1/logout`
- **When**: User confirms logout
- **Request**:
  ```json
  {
    "userId": "user_id"
  }
  ```
- **Headers**:
  ```json
  {
    "ClientName": "stored-client-name",
    "Authorization": "REFRESH_TOKEN"
  }
  ```

**Success Action**: 
- Clears all tokens
- Clears user session
- Generates new guest token
- Redirects to homepage

---

## 2. Cart & Product Modals

### 🛒 Multiple Customizations Modal
**Component**: `components/dialogDrawer/modal/Cart/MultipleCustomizations.tsx`

**Opens From**: 
- Cart page
- PDP when viewing cart item

**Trigger**: User clicks on cart item to edit customizations

**Purpose**: Edit product modifiers/customizations in cart

**APIs Called**:

#### 1. Get Cart (to load current item)
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When**: Modal opens

#### 2. Update Cart Item
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **When**: User saves changes to modifiers
- **Request**:
  ```json
  {
    "id": "cart_item_id",
    "modifierGroups": [
      {
        "modifierGroupId": "group_id",
        "modifiers": [
          {
            "modifierId": "modifier_id",
            "quantity": 2
          }
        ]
      }
    ]
  }
  ```
- **Headers**:
  ```json
  {
    "Store-Id": "store_id",
    "X-User-Location": "{...location data...}"
  }
  ```

**Success Action**: 
- Updates cart
- Refreshes cart display
- Shows updated price

---

### 📝 Special Instructions Modal
**Component**: `components/dialogDrawer/modal/Cart/InstructionsModal.tsx`

**Opens From**: Cart page

**Trigger**: User clicks "Add Instructions" on cart item

**Purpose**: Add/edit special cooking instructions

**APIs Called**:

#### 1. Update Cart Instructions
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **When**: User saves instructions
- **Request**:
  ```json
  {
    "id": "cart_item_id",
    "specialInstructions": "No onions, extra spicy"
  }
  ```
- **Headers**:
  ```json
  {
    "Store-Id": "store_id",
    "X-User-Location": "{...location data...}"
  }
  ```

**Success Action**: 
- Updates cart item
- Shows success message
- Closes modal

---

### ❌ Cancel Order Modal (Cart Clear)
**Component**: `components/dialogDrawer/modal/Cart/CancelOrder.tsx`

**Opens From**: Cart page

**Trigger**: User clicks "Clear Cart" or similar action

**Purpose**: Confirm cart clearing

**APIs Called**:

#### 1. Clear Cart
- **Endpoint**: `PATCH /e-commerce/v1/tenant/cart`
- **When**: User confirms clear
- **Request**:
  ```json
  {
    "id": "cart_id",
    "customType": "cancel"
  }
  ```
- **Headers**:
  ```json
  {
    "Store-Id": "store_id",
    "X-User-Location": "{...location data...}"
  }
  ```

**Success Action**: 
- Empties cart
- Redirects to menu/home

---

### 🔄 Customization Repeat Modal
**Component**: `components/dialogDrawer/modal/Cart/CustomizationRepeat.tsx`

**Opens From**: 
- Cart page
- Reorder flow

**Trigger**: User wants to repeat/duplicate cart item with customizations

**Purpose**: Quick add same item with same customizations

**APIs Called**:

#### 1. Add to Cart (Duplicate)
- **Endpoint**: `POST /e-commerce/v1/tenant/cart`
- **When**: User confirms repeat
- **Request**: Same as original item (product + variants + modifiers)
- **Headers**:
  ```json
  {
    "Store-Id": "store_id",
    "X-User-Location": "{...location data...}"
  }
  ```

---

### ⚠️ Combo Cancel Modal
**Component**: `components/dialogDrawer/modal/ComboCancelModal.tsx`

**Opens From**: Combo product customization flow

**Trigger**: User tries to exit combo customization midway

**Purpose**: Confirm canceling combo customization

**No APIs Called** - Just confirmation dialog

---

### ℹ️ Allergy Info Modal
**Component**: `components/dialogDrawer/modal/AllergyInfoModal.tsx`

**Opens From**: 
- PDP
- Product cards

**Trigger**: User clicks "Allergy Information" icon/link

**Purpose**: Display allergen and dietary information

**No Direct APIs** - Uses product data already loaded

---

## 3. Checkout & Address Modals

### 📍 Add/Edit Address Modal
**Component**: `components/dialogDrawer/modal/Address/AddAddressModal.tsx`

**Opens From**: 
- Checkout page
- Profile page (saved addresses)
- Address selector

**Trigger**: 
- User clicks "Add New Address"
- User clicks edit icon on existing address

**Purpose**: Add new delivery address or edit existing

**APIs Called**:

#### 1. Search Address by Zipcode
- **Endpoint**: `GET https://nominatim.openstreetmap.org/search?q={zipcode}`
- **When**: User enters zipcode
- **Purpose**: Auto-populate city, state, country
- **Service**: `services/location.ts`

#### 2. Reverse Geocode (Get Address from Map)
- **Endpoint**: `GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}`
- **When**: User selects location on map
- **Purpose**: Get address details from coordinates

#### 3. Add Customer Address
- **Endpoint**: `POST /e-commerce/v1/tenant/customer/address`
- **When**: User saves new address
- **Request**:
  ```json
  {
    "addressType": "home",
    "address": "123 Main St",
    "addressLine2": "Apt 4B",
    "landmark": "Near Central Park",
    "zipCode": "10001",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "locationName": "Home",
    "unitNumber": ""
  }
  ```
- **Headers**: `Store-Id: store_id`
- **For Hotel**: Includes `locationName` (hotel name) and `unitNumber` (room)

#### 4. Update Customer Address
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer/address`
- **When**: User updates existing address
- **Request**: Same as add, with `id` field

**Success Action**: 
- Adds/updates address in list
- Closes modal
- Refreshes address list
- Auto-selects new address (if from checkout)

---

### 📱 Mobile Address Selector Modal
**Component**: `components/dialogDrawer/modal/Address/MobileAddressSelector.tsx`

**Opens From**: 
- Checkout page (mobile view)
- Cart page delivery selection

**Trigger**: User clicks "Select Address" on mobile

**Purpose**: Select delivery address from saved list (mobile-optimized)

**APIs Called**:

#### 1. Get Customer Addresses
- **Endpoint**: `GET /e-commerce/v1/tenant/customer/address`
- **When**: Modal opens
- **Headers**: `Store-Id: store_id`
- **Hook**: `hooks/useAddress.ts`

#### 2. Delete Address
- **Endpoint**: `DELETE /e-commerce/v1/tenant/customer/address?id={address_id}`
- **When**: User clicks delete icon
- **Headers**: `Store-Id: store_id`

**Can Open**: Add Address Modal (nested)

---

### 🎟️ Discount Coupons Modal
**Component**: `components/dialogDrawer/modal/CheckOut/DiscountCouponsModal.tsx`

**Opens From**: 
- Checkout page
- Cart page

**Trigger**: User clicks "View Coupons" or "Apply Coupon"

**Purpose**: Display available promo codes and apply them

**APIs Called**:

#### 1. Get Promotions List
- **Endpoint**: `GET /promo-svc/v1/user/promotions/list?cart_id={cart_id}`
- **When**: Modal opens (data passed from parent, but can refresh)
- **Purpose**: Show applicable coupons

**No Direct API in Modal** - Coupon application happens in parent (cart/checkout)

**Can Open**: Promo Details Dialog (nested modal)

---

### 📋 Promo Details Dialog
**Component**: `components/dialogDrawer/modal/CheckOut/PromoDetailsDialog.tsx`

**Opens From**: Discount Coupons Modal

**Trigger**: User clicks "View Details" on a coupon

**Purpose**: Show full terms and conditions of promo

**No APIs Called** - Display only

---

## 4. Order Modals

### 🎁 Freebies Modal
**Component**: `components/dialogDrawer/modal/Order/FreebiesModal.tsx`

**Opens From**: 
- Cart page (when freebies available)
- Checkout page

**Trigger**: User clicks "View Freebies" or freebie offer banner

**Purpose**: Select free items from available offers

**APIs Called**:

#### 1. Get Freebie Offers
- **Endpoint**: `GET /e-commerce/v1/tenant/cart/freebie-offer`
- **Query Parameters**:
  ```
  cartId=cart_id
  offerId=offer_id
  ```
- **Headers**: `Store-Id: store_id`
- **When**: Modal opens
- **Hook**: `hooks/useFreebiesOffer.ts`

#### 2. Add Freebie to Cart
- **Endpoint**: `POST /e-commerce/v1/tenant/cart`
- **When**: User selects freebie product
- **Request**:
  ```json
  {
    "productId": "freebie_product_id",
    "variantId": "variant_id",
    "quantity": 1,
    "isFreebie": true,
    "offerId": "offer_id"
  }
  ```
- **Headers**:
  ```json
  {
    "Store-Id": "store_id",
    "X-User-Location": "{...location data...}"
  }
  ```

**Success Action**: 
- Adds freebie to cart
- Updates cart total (shows $0 for freebie)
- Shows success message

---

### ✅ Order Success Modal
**Component**: `components/dialogDrawer/modal/Order/OrderSuccessModal.tsx`

**Opens From**: 
- Checkout page (after successful order)
- Payment page (after payment success)

**Trigger**: Order placed successfully

**Purpose**: Show order confirmation and details

**No Direct APIs** - Displays order data passed from checkout

**Can Trigger**: 
- Track order page navigation
- Order details page navigation

---

## 5. Profile & Account Modals

### 👤 Update Profile Modal
**Component**: `components/dialogDrawer/modal/EditProfile/UpdateProfileModal.tsx`

**Opens From**: 
- Profile page
- Profile drawer (mobile)
- Header user menu

**Trigger**: User clicks "Edit Profile" or profile fields

**Purpose**: Update user information

**APIs Called**:

#### 1. Update Profile
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer`
- **When**: User saves changes
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

**Success Action**: 
- Updates user session
- Shows success modal
- Refreshes profile display

---

### 📧 Update Email Modal
**Component**: `components/editprofile/UpdateEmail.tsx`

**Opens From**: 
- Profile page
- Update Profile Modal

**Trigger**: User clicks "Change Email"

**Purpose**: Update email address with OTP verification

**APIs Called**:

#### 1. Request Email Update OTP
- **Endpoint**: `GET /e-commerce/v1/tenant/customer/update/email?email={new_email}`
- **When**: User enters new email and clicks "Send OTP"

#### 2. Verify Email OTP
- **Endpoint**: `PATCH /e-commerce/v1/tenant/customer`
- **When**: User enters OTP code
- **Request**:
  ```json
  {
    "email": "newemail@example.com",
    "otp": "123456"
  }
  ```

**Next Action**: Opens Verify OTP Modal

**Success Action**: 
- Updates email
- Shows success modal
- Logs out user (security measure)
- Requires re-login with new email

---

### 📱 Profile Drawer (Mobile)
**Component**: `components/dialogDrawer/modal/EditProfile/ProfileDrawer.tsx`

**Opens From**: Header hamburger menu (mobile)

**Trigger**: User clicks profile icon on mobile

**Purpose**: Mobile profile menu with quick actions

**APIs Called**:

#### 1. Get Cart (for cart count)
- **Endpoint**: `GET /e-commerce/v1/tenant/cart`
- **Headers**: `Store-Id: store_id`
- **When**: Drawer opens

**Can Open**:
- Update Profile Modal
- Update Email Modal
- Logout Modal
- Orders page
- Wishlist page

---

### ✨ Success Modal
**Component**: `components/dialogDrawer/modal/EditProfile/SuccessModal.tsx`

**Opens From**: 
- Update Profile Modal (after success)
- Update Email Modal (after success)

**Trigger**: Successful profile/email update

**Purpose**: Show success confirmation

**No APIs Called** - Display only

---

## 6. Review & Rating Modals

### ⭐ Review Card Modal
**Component**: `components/dialogDrawer/modal/Review/ReviewCard.tsx`

**Opens From**: 
- Order details page
- Order history (delivered orders)
- Review prompt notifications

**Trigger**: 
- User clicks "Write Review" on delivered order
- Auto-prompts after delivery (optional)

**Purpose**: Submit product and/or store review

**APIs Called**:

#### 1. Get Product Parameters
- **Endpoint**: `GET /reviews-svc/v1/reviews/productParameter`
- **When**: Modal opens (for product review)
- **Purpose**: Get review criteria (Taste, Presentation, etc.)

#### 2. Get Store Parameters
- **Endpoint**: `GET /reviews-svc/v1/reviews/storeParameter`
- **When**: Modal opens (for store review)
- **Purpose**: Get store review criteria (Service, Ambiance, etc.)

#### 3. Get Order Reviews (Check Existing)
- **Endpoint**: `GET /reviews-svc/v1/reviews?order_id={order_id}`
- **When**: Modal opens
- **Purpose**: Check if user already reviewed this order
- **Hook**: `hooks/useOrderReviews.ts`

#### 4. Upload Review Images (if applicable)
- **Endpoint**: `POST /e-commerce/v1/upload/multiple`
- **When**: User attaches images
- **Request**:
  ```json
  {
    "files": [
      {
        "fileName": "review-photo.jpg",
        "fileType": "image/jpeg",
        "fileSize": 204800
      }
    ],
    "uploadType": "review"
  }
  ```
- **Then**: Direct upload to S3 presigned URL

#### 5. Submit Product Review
- **Endpoint**: `POST /reviews-svc/v1/reviews`
- **Headers**: `Store-Id: store_id`
- **When**: User submits product review
- **Request**:
  ```json
  {
    "product_id": "product_id",
    "order_id": "order_id",
    "overall_rating": 4.5,
    "title": "Great burger!",
    "content": "Really enjoyed this, highly recommend",
    "parameterRatings": [
      {
        "parameterId": "taste_param_id",
        "parameterName": "Taste",
        "rating": 5
      },
      {
        "parameterId": "presentation_param_id",
        "parameterName": "Presentation",
        "rating": 4
      }
    ],
    "images": [
      "https://cdn.example.com/review-photo.jpg"
    ]
  }
  ```

#### 6. Submit Store Review
- **Endpoint**: `POST /reviews-svc/v1/reviews/storeReview`
- **Headers**: `Store-Id: store_id`
- **When**: User submits store review
- **Request**:
  ```json
  {
    "order_id": "order_id",
    "overall_rating": 4.5,
    "title": "Great experience!",
    "content": "Excellent service and ambiance",
    "parameterRatings": [
      {
        "parameterId": "service_param_id",
        "parameterName": "Service",
        "rating": 5
      },
      {
        "parameterId": "ambiance_param_id",
        "parameterName": "Ambiance",
        "rating": 4
      }
    ]
  }
  ```

**Success Action**: 
- Shows success message
- Closes modal
- Marks order as reviewed
- May show reward points earned

---

## 7. Informational Modals

### 🍔 Menu Modal
**Component**: `components/dialogDrawer/modal/MenuModal.tsx`

**Opens From**: 
- Header
- Store page

**Trigger**: User clicks menu icon/button

**Purpose**: Navigate between different menus (Lunch, Dinner, etc.)

**APIs Called**:

#### 1. Get Store Categories
- **Endpoint**: `GET /e-commerce/v1/tenant/menu/categories`
- **Query**: `menuSlug=lunch-menu&storeSlug=store-slug`
- **When**: Menu selection changes
- **Hook**: `hooks/storepage/useCategories.ts`

**Success Action**: 
- Updates category list
- Navigates to selected menu

---

### 🎨 Feature Modal
**Component**: `components/dialogDrawer/modal/feature-modal.tsx`

**Opens From**: Various pages (promotional banners)

**Trigger**: User clicks feature announcement

**Purpose**: Show new features or announcements

**No APIs Called** - Content driven

---

### 🗑️ Delete Modal
**Component**: `components/dialogDrawer/modal/DeleteModal.tsx`

**Opens From**: 
- Address list (delete address)
- Any delete action

**Trigger**: User clicks delete icon

**Purpose**: Confirm deletion

**APIs Depend on Context**:
- Delete Address: `DELETE /e-commerce/v1/tenant/customer/address?id={id}`
- Delete Recent Search: `DELETE /e-commerce/v1/tenant/recentSearch?id={id}`

---

## 8. Payment Modals

### 💳 Payment Client Modal
**Component**: `components/payment/PaymentClient.tsx`

**Opens From**: 
- Checkout page (after order placement)
- Payment page
- Can be intercepted modal

**Trigger**: 
- Order requires payment
- Payment intent created

**Purpose**: Stripe payment integration

**APIs Called**:

#### 1. Create Payment Intent
- **Endpoint**: `POST /integration-svc/v1/payments/intent`
- **Headers**: `Store-Id: store_id`
- **When**: Payment modal opens
- **Request**:
  ```json
  {
    "orderId": "order_id"
  }
  ```
- **Response**:
  ```json
  {
    "client_secret": "pi_xxx_secret_yyy",
    "amount": 2810,
    "message": "Payment intent created",
    "customerSessionClientSecret": "cus_session_xxx"
  }
  ```
- **Hook**: `hooks/usePayment.ts`

#### 2. Payment Webhook (Background)
- **Endpoint**: `POST /e-commerce/v1/payments/webhook`
- **When**: Payment completed (called by Stripe)
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

**Success Action**: 
- Shows order success modal
- Navigates to order tracking
- Sends confirmation email

**Failure Action**: 
- Shows error message
- Allows retry
- Can cancel payment intent

---

## 📊 Modal Flow Diagrams

### Complete User Journey - New User Order:

```
1. Guest Browse → [No Modal]
2. Click Login → [Login Modal] → API: POST loginWithOtp
3. Enter OTP → [Verify OTP Modal] → API: PATCH loginWithOtp (verify)
   OR Click Signup → [Signup Modal] → API: POST signup
4. Add to Cart → [No Modal] → API: POST cart
5. View Cart → [No Modal] → API: GET cart
6. Checkout → [Address Modal] → API: POST address, GET reverse-geocode
7. Select Address → [Mobile Address Selector] → API: GET addresses
8. View Coupons → [Discount Coupons Modal] → API: GET promotions/list
9. Place Order → [No Modal] → API: POST order
10. Payment → [Payment Client Modal] → API: POST payments/intent
11. Success → [Order Success Modal] → Navigate to tracking
12. After Delivery → [Review Card Modal] → API: POST reviews
```

### Profile Update Journey:

```
1. Click Profile → [Profile Drawer (mobile)] or Profile Page
2. Edit Profile → [Update Profile Modal] → API: PATCH customer
3. Change Email → [Update Email Modal] → API: GET update/email
4. Enter OTP → [Verify OTP Modal] → API: PATCH customer (with OTP)
5. Success → [Success Modal] → Logout (security)
```

### Address Management Journey:

```
1. Checkout → Click Address → [Mobile Address Selector]
2. Add New → [Add Address Modal]
3. Search Map → API: GET nominatim/search
4. Select Location → API: GET nominatim/reverse
5. Save → API: POST customer/address
6. Success → Back to checkout with selected address
```

---

## 🎯 Modal API Summary

| Modal | # APIs | Most Critical API | Can Open Nested Modal |
|-------|--------|-------------------|----------------------|
| Login Modal | 2 | POST loginWithOtp | ✅ Verify OTP, Signup |
| Verify OTP Modal | 1 | PATCH loginWithOtp | ❌ |
| Signup Modal | 2 | POST signup, POST validate/phone | ❌ |
| Logout Modal | 1 | POST logout | ❌ |
| Multiple Customizations | 2 | GET cart, PATCH cart | ❌ |
| Instructions Modal | 1 | PATCH cart | ❌ |
| Cancel Order (Cart) | 1 | PATCH cart | ❌ |
| Add Address Modal | 4 | POST address, nominatim APIs | ❌ |
| Mobile Address Selector | 2 | GET addresses, DELETE address | ✅ Add Address |
| Discount Coupons | 0* | GET promotions (parent) | ✅ Promo Details |
| Freebies Modal | 2 | GET freebie-offer, POST cart | ❌ |
| Update Profile Modal | 1 | PATCH customer | ✅ Update Email |
| Update Email Modal | 2 | GET update/email, PATCH customer | ✅ Verify OTP |
| Profile Drawer | 1 | GET cart | ✅ Multiple |
| Review Card Modal | 6 | POST reviews, GET parameters | ❌ |
| Payment Client Modal | 2 | POST payments/intent | ❌ |
| Menu Modal | 1 | GET categories | ❌ |

*Discount Coupons Modal receives data from parent, doesn't call API directly

---

## 🔔 Important Notes for Mobile Implementation

### 1. **Modal Stacking**
Some modals can open other modals (nested). Ensure proper stack management:
- Login → Verify OTP → Success
- Checkout → Address Selector → Add Address → Map
- Profile → Update Email → Verify OTP

### 2. **API Call Timing**
- **On Open**: Login, Address List, Freebies
- **On Action**: Submit buttons, Save buttons
- **Real-time**: Phone validation (debounced)
- **Background**: Payment webhook

### 3. **Error Handling in Modals**
- Show inline errors (don't close modal)
- Validation errors before API call
- API errors with retry option
- Network errors with offline message

### 4. **Success Actions**
- Most modals close on success
- Some chain to next modal
- Some redirect to different page
- Some just update parent state

### 5. **Headers Required**
Almost all modal APIs need:
- `Tenant-Id`: Always
- `Store-Id`: For store-specific (cart, address, orders)
- `X-User-Location`: For POST/PATCH operations
- `Authorization`: For authenticated users

### 6. **Mobile-Specific Modals**
- Profile Drawer (mobile only)
- Mobile Address Selector (mobile optimized)
- Bottom sheets recommended over center modals

### 7. **File Uploads in Modals**
- Review images: 2-step process (presigned URL → S3)
- Profile pictures: Same flow
- Show upload progress
- Handle upload failures

---

## 🔄 Modal Lifecycle API Pattern

```javascript
// Common pattern across modals

1. Modal Opens
   ↓
2. Load Initial Data (if needed)
   - GET request to fetch options/lists
   ↓
3. User Interaction
   - Real-time validation (debounced)
   - Field-level API calls
   ↓
4. Submit Action
   - POST/PATCH request with form data
   ↓
5. Success/Error Handling
   - Success: Close modal, update parent, show next modal
   - Error: Show message, allow retry
```

---

## 📝 Testing Checklist for Modals

- [ ] Modal opens with correct trigger
- [ ] Initial data loads properly
- [ ] Form validation works
- [ ] API calls have correct headers
- [ ] Loading states shown during API calls
- [ ] Success messages displayed
- [ ] Error messages shown appropriately
- [ ] Modal closes on success
- [ ] Parent page updates after modal action
- [ ] Nested modals stack properly
- [ ] Back button behavior correct
- [ ] Keyboard handling (mobile)
- [ ] Can dismiss modal (close button, back, outside click)

---

*Last Updated: December 2024*  
*Total Modals Documented: 25+*  
*Modals with API Calls: 18*  
*Total Unique APIs Called from Modals: 30+*

