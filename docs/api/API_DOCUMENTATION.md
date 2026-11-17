# PlateAway API Documentation for Mobile Development

> **📚 Documentation Navigation**  
> **You are here**: Complete API Reference  
> **See also**: [Quick Reference](./API_QUICK_REFERENCE.md) | [Page Mapping](./API_PAGES_MAPPING.md) | [Modal Mapping](./API_MODALS_DIALOGS_MAPPING.md) | [API Docs Home](./README.md)

---

## Table of Contents
1. [Authentication & Token Management](#authentication--token-management)
2. [Store & Menu APIs](#store--menu-apis)
3. [Product APIs](#product-apis)
4. [Cart Management](#cart-management)
5. [Checkout & Address](#checkout--address)
6. [Order Management](#order-management)
7. [Payment APIs](#payment-apis)
8. [Reviews & Ratings](#reviews--ratings)
9. [User Profile](#user-profile)
10. [Wishlist](#wishlist)
11. [Offers & Promotions](#offers--promotions)
12. [Search & Recent Search](#search--recent-search)
13. [Events](#events)
14. [File Upload](#file-upload)
15. [Page Management](#page-management)
16. [Location Services](#location-services)
17. [Common Headers & Configuration](#common-headers--configuration)

---

## Base Configuration

### Base URL
```
BASE_URL: process.env.NEXT_PUBLIC_API_URL
```

### Common Headers
All requests must include:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN"
}
```

### Additional Headers (When Applicable)
- **Store-Id**: Required for store-specific operations
- **X-User-Location**: JSON stringified user location data (see [Location Services](#location-services))
- **ClientName**: Used in logout and refresh token operations

---

## Authentication & Token Management

### 1. Guest Authentication
**Endpoint**: `POST /e-commerce/v1/tenant/customer/guest-auth`

**Purpose**: Generate initial access token for guest users

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID"
}
```

**Request Body**:
```json
{
  "fingerprintId": "unique-device-fingerprint"
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "refresh_token_string"
    },
    "expires_in": 3600,
    "id": "customer_id",
    "clientName": "web-client"
  }
}
```

**Important Notes**:
- Store both `access_token` and `refresh_token` securely
- Store `clientName` for refresh operations
- The `fingerprintId` should be a unique device identifier

---

### 2. Refresh Access Token
**Endpoint**: `GET /e-commerce/v1/refreshToken`

**Purpose**: Refresh expired access token using refresh token

**Headers**:
```json
{
  "ClientName": "stored-client-name",
  "Authorization": "REFRESH_TOKEN"
}
```

**Response**:
```json
{
  "data": {
    "token": {
      "access_token": "new_access_token",
      "refresh_token": "new_refresh_token"
    },
    "clientName": "web-client"
  }
}
```

**Error Handling**:
- **401/406**: Token expired or invalid → Generate new guest token
- **500**: Server error → Generate new guest token
- **403**: Forbidden → Clear all tokens and re-authenticate

---

### 3. Login with Email OTP (Request OTP)
**Endpoint**: `POST /e-commerce/v1/tenant/customer/loginWithOtp`

**Purpose**: Request OTP for email login

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "otpType": "email" // or "phone"
}
```

**Response**:
```json
{
  "status": 200,
  "message": "OTP sent successfully"
}
```

---

### 4. Login with Email OTP (Verify OTP)
**Endpoint**: `PATCH /e-commerce/v1/tenant/customer/loginWithOtp`

**Purpose**: Verify OTP and complete login

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "GUEST_TOKEN",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "otpType": "email"
}
```

**Response**:
```json
{
  "status": 200,
  "data": {
    "token": {
      "access_token": "user_access_token",
      "refresh_token": "user_refresh_token"
    },
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 5. Signup
**Endpoint**: `POST /e-commerce/v1/tenant/customer/signup`

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
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

**Response**:
```json
{
  "status": 200,
  "data": {
    "token": {
      "access_token": "new_user_token",
      "refresh_token": "new_refresh_token"
    },
    "id": "new_user_id"
  }
}
```

---

### 6. Validate Phone Number
**Endpoint**: `POST /e-commerce/v1/tenant/customer/validate/phone`

**Purpose**: Check if phone number is already registered

**Request Body**:
```json
{
  "phone": "1234567890",
  "countryCode": "+1",
  "phoneIsoCode": "US",
  "email": "user@example.com"
}
```

---

### 7. Google OAuth
**Endpoint**: `POST /e-commerce/v1/googleAuth/food`

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "code": "google_auth_code"
}
```

**Response**: Same as login response with tokens

---

### 8. Token Exchange
**Endpoint**: `GET /e-commerce/v1/tenant/customer/tokenExchange`

**Purpose**: Exchange token for specific storefront access

**Query Parameters**:
- `storefrontId`: Store ID

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer CURRENT_TOKEN"
}
```

**Response**:
```json
{
  "data": {
    "token": {
      "access_token": "storefront_specific_token"
    }
  }
}
```

---

### 9. Logout
**Endpoint**: `POST /e-commerce/v1/logout`

**Headers**:
```json
{
  "ClientName": "stored-client-name",
  "Authorization": "REFRESH_TOKEN"
}
```

**Request Body**:
```json
{
  "userId": "user_id"
}
```

---

## Store & Menu APIs

### 10. Get Page Configuration
**Endpoint**: `GET /e-commerce/v1/tenant/config`

**Purpose**: Fetch tenant/page configuration including SEO, theme, etc.

**Query Parameters**:
- `pageType`: Page type (e.g., "home", "store", "product", "category")
- `storeSlug`: Store slug (optional)
- `categorySlug`: Category slug (optional)
- `productSlug`: Product slug (optional)
- `productId`: Product ID (optional)
- `storeId`: Store ID (optional)
- `categoryId`: Category ID (optional)

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "Cache-Control": "public, max-age=900"
}
```

**Response**:
```json
{
  "data": {
    "seo": {
      "title": "Page Title",
      "description": "Page Description",
      "keywords": ["keyword1", "keyword2"]
    },
    "pageConfig": {
      "title": "Store Name",
      "slug": "store-slug",
      "subheader": "Tagline",
      "images": [
        {
          "id": 1,
          "url": "https://cdn.example.com/image.jpg"
        }
      ]
    },
    "tenantId": "tenant_id"
  }
}
```

---

### 11. Get Tenant Stores
**Endpoint**: `GET /e-commerce/v1/tenant/store`

**Purpose**: Get list of stores based on user location

**Query Parameters**:
- `latitude`: User latitude
- `longitude`: User longitude
- `timezone`: Client timezone (e.g., "America/New_York")

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN"
}
```

**Response**:
```json
{
  "data": {
    "stores": [
      {
        "id": "store_id",
        "name": "Store Name",
        "slug": "store-slug",
        "address": "123 Main St",
        "image": "store_image_url",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "distance": 2.5,
        "isOpen": true,
        "hours": {
          "monday": "09:00-22:00"
        }
      }
    ]
  }
}
```

**Cache Strategy**: Client should cache for ~5 minutes based on lat/long

---

### 12. Get Store Categories
**Endpoint**: `GET /e-commerce/v1/tenant/menu/categories`

**Purpose**: Get menu categories for a specific store

**Query Parameters**:
- `menuSlug`: Menu slug (optional)
- `storeSlug`: Store slug (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "category_id",
      "name": {
        "en": "Appetizers",
        "ar": "المقبلات"
      },
      "slug": "appetizers",
      "description": "Category description",
      "image": "category_image_url",
      "sortOrder": 1,
      "productCount": 15
    }
  ]
}
```

---

### 13. Get Store Products
**Endpoint**: `GET /e-commerce/v1/tenant/products`

**Purpose**: Get products by menu and category

**Query Parameters**:
- `menuId`: Menu ID
- `categoryId`: Category ID

**Response**:
```json
{
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "basePrice": 12.99,
      "discountedPrice": 9.99,
      "categoryId": "category_id",
      "mediaUrl": "product_image_url",
      "promotion": "20% OFF",
      "nutritionalInfo": {
        "values": {
          "calories": 350
        }
      }
    }
  ]
}
```

---

## Product APIs

### 14. Get Product Details
**Endpoint**: `GET /e-commerce/v1/tenant/product`

**Purpose**: Get detailed product information for PDP (Product Detail Page)

**Query Parameters**:
- `categorySlug`: Category slug
- `productSlug`: Product slug
- `storeSlug`: Store slug

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "productId": "product_id",
    "name": {
      "en": "Deluxe Burger"
    },
    "description": {
      "en": "A delicious burger with premium ingredients"
    },
    "media": [
      {
        "_id": "media_id",
        "type": "image",
        "url": "https://cdn.example.com/burger.jpg",
        "metadata": {
          "thumbnail": "thumb_url",
          "isPrimary": true
        }
      }
    ],
    "type": {
      "hasVariants": true,
      "hasModifiers": true,
      "canBeSoldIndependently": true
    },
    "variants": [
      {
        "variantId": "variant_id",
        "variantSku": "BRG-SM",
        "attributes": {
          "size": "Small"
        },
        "basePrice": 8.99,
        "discountedPrice": 7.99,
        "inventory": {
          "available": true,
          "quantity": 50
        }
      }
    ],
    "modifierGroups": [
      {
        "modifierGroupId": "group_id",
        "name": {
          "en": "Extras"
        },
        "selectionType": "single", // or "multiple"
        "minSelection": 0,
        "maxSelection": 3,
        "modifiers": [
          {
            "modifierId": "modifier_id",
            "name": {
              "en": "Extra Cheese"
            },
            "price": 1.50,
            "isDefault": false
          }
        ]
      }
    ],
    "nutritionalInfo": {
      "calories": 450,
      "protein": 25,
      "carbs": 35,
      "fat": 18
    },
    "overallRatings": {
      "average": 4.5,
      "totalReview": 128
    },
    "seo": {
      "title": "Deluxe Burger - Store Name",
      "description": "SEO description"
    }
  }
}
```

---

### 15. Get Combo Product Details
**Endpoint**: `GET /e-commerce/v1/tenant/product`

**Purpose**: Get combo/meal deal product details

**Query Parameters**:
- `categoryId`: Category ID
- `productSlug`: Product slug
- `storeSlug`: Store slug

**Response**:
```json
{
  "status": "success",
  "data": {
    "productId": "combo_id",
    "type": {
      "isCombo": true
    },
    "comboGroups": [
      {
        "groupName": "Main Course",
        "minSelection": 1,
        "maxSelection": 1,
        "products": [
          {
            "productId": "product_id",
            "name": "Burger",
            "basePrice": 8.99
          }
        ]
      },
      {
        "groupName": "Side",
        "minSelection": 1,
        "maxSelection": 2,
        "products": [...]
      }
    ]
  }
}
```

---

### 16. Get Popular Products
**Endpoint**: `GET /e-commerce/v1/tenant/product/popular-products`

**Purpose**: Get list of popular/trending products

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "productId": "product_id",
      "name": {
        "en": "Popular Item"
      },
      "basePrice": 12.99,
      "discountedPrice": 9.99,
      "media": [...],
      "overallRatings": {
        "average": 4.8,
        "totalReview": 256
      }
    }
  ],
  "totalCount": 20
}
```

---

### 17. Get Product Stores
**Endpoint**: `GET /e-commerce/v1/tenant/product/getStores`

**Purpose**: Get list of stores where a product is available

**Query Parameters**:
- `productId`: Product ID

**Response**:
```json
{
  "data": [
    {
      "storefrontId": "store_id",
      "storeName": "Store Name",
      "storeSlug": "store-slug",
      "address": "123 Main St",
      "distance": 2.5
    }
  ]
}
```

---

## Cart Management

### 18. Get Cart
**Endpoint**: `GET /e-commerce/v1/tenant/cart`

**Purpose**: Retrieve current cart items

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": {
    "id": "cart_id",
    "storefrontId": "store_id",
    "items": [
      {
        "id": "cart_item_id",
        "productId": "product_id",
        "productName": {
          "en": "Burger"
        },
        "productSlug": "burger",
        "productCategoryId": "category_id",
        "productCategory": {
          "en": "Main Course"
        },
        "productCategorySlug": "main-course",
        "variantId": "variant_id",
        "variantSku": "BRG-LG",
        "variantAttributes": {
          "size": "Large"
        },
        "quantity": 2,
        "unitBasePrice": 12.99,
        "totalBasePrice": 25.98,
        "modifierGroup": [
          {
            "id": "modifier_group_id",
            "modifierGroupId": "group_id",
            "modifierGroupName": {
              "en": "Extras"
            },
            "modifiers": [
              {
                "id": "modifier_id",
                "modifierId": "mod_id",
                "modifierName": {
                  "en": "Extra Cheese"
                },
                "quantity": 1,
                "unitPrice": 1.50,
                "totalPrice": 1.50
              }
            ],
            "modifiersPrice": 1.50
          }
        ],
        "baseModifiersPrice": 1.50,
        "finalModifiersPrice": 1.50,
        "subTotalBeforeDiscountAndTaxes": 27.48,
        "hasProductOffer": true,
        "productOfferType": "percentage",
        "productOfferValue": 10,
        "productOfferDescription": "10% off on this item",
        "offerDiscountAmount": 2.75,
        "totalDiscountAmount": 2.75,
        "subTotalAfterDiscount": 24.73,
        "taxRate": 8.5,
        "taxAmount": 2.10,
        "finalPrice": 26.83,
        "specialInstructions": "No onions",
        "menuSlug": "lunch-menu"
      }
    ],
    "total": {
      "itemsCount": 2,
      "subtotal": 27.48,
      "totalDiscount": 2.75,
      "totalTax": 2.10,
      "deliveryFee": 3.00,
      "finalAmount": 29.83
    },
    "orderType": "delivery", // or "pickup", "dine-in"
    "appliedPromoCode": {
      "id": "promo_id",
      "promoCode": "SAVE10",
      "promoCodeDiscountAmount": 2.75
    },
    "appliedOffers": [
      {
        "id": "offer_id",
        "offerId": "off_id",
        "offerName": {
          "en": "Buy 1 Get 1"
        },
        "offerType": "bogo",
        "discountAmount": 12.99,
        "freeQuantity": 1
      }
    ]
  }
}
```

---

### 19. Add to Cart
**Endpoint**: `POST /e-commerce/v1/tenant/cart`

**Purpose**: Add a single product to cart

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "Store-Id": "STORE_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA",
  "Content-Type": "application/json"
}
```

**Request Body** (Simple Product):
```json
{
  "productId": "product_id",
  "variantId": "variant_id",
  "quantity": 2,
  "specialInstructions": "No onions please",
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

**Request Body** (Combo Product):
```json
{
  "quantity": 1,
  "productId": "combo_product_id",
  "comboPrimaryProductId": "main_product_id",
  "comboPrimaryProductVariantId": "variant_id",
  "comboPrimaryProductModifierGroups": [
    {
      "modifierGroupId": "group_id",
      "modifiers": [
        {
          "modifierId": "modifier_id",
          "quantity": 1
        }
      ]
    }
  ],
  "comboProducts": [
    {
      "groupName": "Side",
      "productId": "side_product_id",
      "variantId": "side_variant_id",
      "modifierGroups": [
        {
          "modifierGroupId": "side_modifier_group",
          "modifiers": [
            {
              "modifierId": "side_modifier",
              "quantity": 1
            }
          ]
        }
      ]
    },
    {
      "groupName": "Drink",
      "productId": "drink_product_id",
      "variantId": "drink_variant_id"
    }
  ]
}
```

**Response**: Returns updated cart (same as Get Cart response)

---

### 20. Update Cart
**Endpoint**: `PATCH /e-commerce/v1/tenant/cart`

**Purpose**: Update cart item quantity or modifiers

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "Store-Id": "STORE_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "id": "cart_item_id",
  "quantity": 3,
  "specialInstructions": "Updated instructions"
}
```

**Response**: Returns updated cart

---

### 21. Cancel Order (Clear Cart)
**Endpoint**: `PATCH /e-commerce/v1/tenant/cart`

**Purpose**: Clear cart or cancel order

**Headers**:
```json
{
  "Store-Id": "STORE_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "id": "cart_id",
  "customType": "cancel"
}
```

---

### 22. Get Upsell Products
**Endpoint**: `GET /e-commerce/v1/tenant/cart/upsell-products`

**Purpose**: Get recommended products based on cart items

**Query Parameters**:
- `cartItemIds`: Comma-separated cart item IDs (e.g., "id1,id2,id3")

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": [
    {
      "productId": "upsell_product_id",
      "name": "Recommended Item",
      "basePrice": 4.99,
      "discountedPrice": 3.99
    }
  ]
}
```

---

### 23. Get Freebie Offers
**Endpoint**: `GET /e-commerce/v1/tenant/cart/freebie-offer`

**Purpose**: Get available freebies for current cart

**Query Parameters**:
- `cartId`: Cart ID
- `offerId`: Offer ID (optional)

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": {
    "offerId": "offer_id",
    "offerName": "Free Dessert",
    "freebieProducts": [
      {
        "productId": "freebie_product_id",
        "name": "Ice Cream",
        "quantity": 1
      }
    ],
    "eligibilityMet": true,
    "minimumSpend": 25.00,
    "currentCartValue": 30.00
  }
}
```

---

## Checkout & Address

### 24. Get Customer Addresses
**Endpoint**: `GET /e-commerce/v1/tenant/customer/address`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "address_id",
      "addressType": "home", // or "work", "other"
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
  ]
}
```

---

### 25. Add Customer Address
**Endpoint**: `POST /e-commerce/v1/tenant/customer/address`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
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

**Response**: Returns created address

---

### 26. Update Customer Address
**Endpoint**: `PATCH /e-commerce/v1/tenant/customer/address`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "id": "address_id",
  "street": "456 Updated St",
  "isDefault": false
}
```

---

### 27. Delete Customer Address
**Endpoint**: `DELETE /e-commerce/v1/tenant/customer/address`

**Query Parameters**:
- `id`: Address ID

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

---

### 28. Calculate Delivery Fee
**Endpoint**: `GET /e-commerce/v1/tenant/order/calculateDeliveryFee`

**Purpose**: Calculate delivery fee based on address

**Query Parameters**:
- `cartId`: Cart ID
- `deliveryAddressLat`: Delivery address latitude
- `deliveryAddressLng`: Delivery address longitude

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": {
    "deliveryFee": 3.50,
    "estimatedTime": 30, // minutes
    "distance": 2.5 // km
  }
}
```

---

### 29. Get Promotions List
**Endpoint**: `GET /promo-svc/v1/user/promotions/list`

**Purpose**: Get available promotions/coupons for cart

**Query Parameters**:
- `cart_id`: Cart ID

**Response**:
```json
{
  "data": [
    {
      "id": "promo_id",
      "promoCode": "SAVE10",
      "discountType": "percentage", // or "fixed"
      "discountValue": 10,
      "minOrderValue": 20.00,
      "maxDiscount": 5.00,
      "validUntil": "2024-12-31T23:59:59Z",
      "description": "Get 10% off on orders above $20"
    }
  ]
}
```

---

### 30. Checkout / Place Order
**Endpoint**: `POST /e-commerce/v1/tenant/order`

**Purpose**: Place an order

**Headers**:
```json
{
  "Store-Id": "STORE_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "cartId": "cart_id",
  "orderType": "delivery", // or "pickup", "dine-in"
  "paymentMethod": "card", // or "cash", "online"
  "deliveryAddress": {
    "id": "address_id"
  },
  "scheduledTime": "2024-12-05T18:00:00Z", // optional, for scheduled orders
  "customerNotes": "Please call on arrival",
  "promoCode": "SAVE10", // optional
  "tipAmount": 5.00, // optional
  "contactPhone": "+1234567890",
  "contactEmail": "user@example.com"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "orderId": "order_id",
    "orderNumber": "ORD-12345",
    "status": "pending",
    "estimatedDeliveryTime": "2024-12-05T18:30:00Z",
    "total": {
      "subtotal": 25.00,
      "deliveryFee": 3.50,
      "tax": 2.10,
      "discount": 2.50,
      "tip": 5.00,
      "finalAmount": 33.10
    },
    "paymentRequired": true,
    "paymentIntentId": "pi_xxx" // if payment required
  }
}
```

---

## Order Management

### 31. Get All Orders
**Endpoint**: `GET /e-commerce/v1/tenant/order`

**Purpose**: Get user's order history

**Query Parameters**:
- `status`: Order status filter (optional) - "pending", "confirmed", "preparing", "ready", "completed", "cancelled"
- `q`: Search term (optional) - search by order number or items
- `timeFilter`: Time filter (optional) - "TODAY", "LAST_7_DAYS", "LAST_30_DAYS", "CUSTOM_DATE"
- `startDate`: Start date in Unix milliseconds (required if timeFilter is CUSTOM_DATE)
- `endDate`: End date in Unix milliseconds (required if timeFilter is CUSTOM_DATE)

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID"
}
```

**Response**:
```json
{
  "data": {
    "orders": [
      {
        "orderId": "order_id",
        "orderNumber": "ORD-12345",
        "status": "completed",
        "orderType": "delivery",
        "store": {
          "id": "store_id",
          "name": "Store Name",
          "address": "123 Store St"
        },
        "items": [
          {
            "productId": "product_id",
            "productName": "Burger",
            "quantity": 2,
            "unitPrice": 12.99,
            "totalPrice": 25.98,
            "image": "product_image_url"
          }
        ],
        "total": {
          "subtotal": 25.00,
          "deliveryFee": 3.50,
          "tax": 2.10,
          "discount": 2.50,
          "finalAmount": 28.10
        },
        "deliveryAddress": {
          "street": "123 Main St",
          "city": "New York",
          "zipCode": "10001"
        },
        "createdAt": "2024-12-05T14:30:00Z",
        "estimatedDeliveryTime": "2024-12-05T15:00:00Z",
        "actualDeliveryTime": "2024-12-05T14:55:00Z",
        "canReorder": true,
        "canCancel": false,
        "canReview": true
      }
    ],
    "totalCount": 45,
    "page": 1,
    "limit": 10
  }
}
```

---

### 32. Get Order by ID
**Endpoint**: `GET /e-commerce/v1/tenant/order`

**Purpose**: Get detailed information for a specific order

**Query Parameters**:
- `orderId`: Order ID

**Response**: Same structure as single order in Get All Orders, with more details:
```json
{
  "data": {
    "orderId": "order_id",
    "orderNumber": "ORD-12345",
    "status": "completed",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-12-05T14:30:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2024-12-05T14:32:00Z"
      },
      {
        "status": "preparing",
        "timestamp": "2024-12-05T14:35:00Z"
      },
      {
        "status": "ready",
        "timestamp": "2024-12-05T14:45:00Z"
      },
      {
        "status": "completed",
        "timestamp": "2024-12-05T14:55:00Z"
      }
    ],
    "driver": {
      "name": "John Driver",
      "phone": "+1234567890",
      "currentLocation": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "trackingUrl": "https://tracking.example.com/order_id",
    // ... rest of order details
  }
}
```

---

### 33. Get Order Cancel Reasons
**Endpoint**: `GET /e-commerce/v1/cancellation/reason`

**Purpose**: Get list of cancellation reasons

**Query Parameters**:
- `isStoreReason`: Boolean (false for customer reasons, true for store reasons)

**Response**:
```json
{
  "data": [
    {
      "id": "reason_id",
      "reason": "Changed my mind",
      "type": "customer"
    },
    {
      "id": "reason_id_2",
      "reason": "Ordered by mistake",
      "type": "customer"
    }
  ]
}
```

---

### 34. Cancel Order
**Endpoint**: `PATCH /e-commerce/v1/tenant/order/cancel`

**Purpose**: Cancel an order

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "orderId": "order_id",
  "reasonId": "reason_id"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "orderId": "order_id",
    "status": "cancelled",
    "refundAmount": 28.10,
    "refundStatus": "pending",
    "estimatedRefundTime": "3-5 business days"
  }
}
```

---

### 35. Reorder
**Endpoint**: `GET /e-commerce/v1/tenant/order/reorder`

**Purpose**: Get products from previous order for quick reordering

**Query Parameters**:
- `storeSlug`: Store slug
- `menuSlug`: Menu slug (optional)

**Response**:
```json
{
  "data": [
    {
      "productId": "product_id",
      "name": "Burger",
      "basePrice": 12.99,
      "discountedPrice": 9.99,
      "image": "product_image_url",
      "lastOrderedDate": "2024-12-05T14:30:00Z",
      "orderCount": 5,
      "isAvailable": true
    }
  ]
}
```

---

## Payment APIs

### 36. Create Payment Intent
**Endpoint**: `POST /integration-svc/v1/payments/intent`

**Purpose**: Create payment intent for Stripe/payment gateway

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "orderId": "order_id"
}
```

**Response**:
```json
{
  "client_secret": "pi_xxx_secret_yyy",
  "amount": 2810, // in cents
  "message": "Payment intent created successfully",
  "customerSessionClientSecret": "cus_session_xxx"
}
```

**Usage**: Pass `client_secret` to Stripe SDK to complete payment

---

### 37. Payment Webhook
**Endpoint**: `POST /e-commerce/v1/payments/webhook`

**Purpose**: Handle payment status updates (used internally, but mobile may need for confirmation)

**Request Body**:
```json
{
  "orderId": "order_id",
  "paymentIntentId": "pi_xxx",
  "status": "succeeded", // or "failed", "canceled"
  "amount": 2810,
  "currency": "usd"
}
```

---

## Reviews & Ratings

### 38. Get Product Parameters (for reviews)
**Endpoint**: `GET /reviews-svc/v1/reviews/productParameter`

**Purpose**: Get review parameters/criteria for products

**Response**:
```json
{
  "data": [
    {
      "parameterId": "param_id",
      "parameterName": "Taste",
      "maxRating": 5
    },
    {
      "parameterId": "param_id_2",
      "parameterName": "Presentation",
      "maxRating": 5
    }
  ]
}
```

---

### 39. Get Product Reviews
**Endpoint**: `GET /reviews-svc/v1/reviews`

**Purpose**: Get reviews for a product

**Query Parameters**:
- `product_id`: Product ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `is_product_review`: 1 for product reviews, 0 for store reviews
- `status`: Review status (optional) - "active", "pending", "rejected"

**Headers**:
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "data": {
    "reviews": [
      {
        "id": "review_id",
        "user_firstname": "John",
        "user_lastname": "Doe",
        "user_profilepic": "avatar_url",
        "overall_rating": 4.5,
        "title": "Great product!",
        "content": "Really enjoyed this, highly recommend",
        "created_at": "2024-12-05T14:30:00Z",
        "status": "active",
        "parameterRatings": [
          {
            "parameterName": "Taste",
            "rating": 5
          },
          {
            "parameterName": "Presentation",
            "rating": 4
          }
        ],
        "helpfulCount": 12,
        "images": ["review_image_url"]
      }
    ],
    "overallRating": {
      "average": 4.5,
      "totalReview": 128,
      "starDistribution": {
        "5": 80,
        "4": 30,
        "3": 10,
        "2": 5,
        "1": 3
      },
      "percentages": {
        "5": 62.5,
        "4": 23.4,
        "3": 7.8,
        "2": 3.9,
        "1": 2.3
      }
    },
    "totalCount": 128,
    "page": 1,
    "limit": 10
  }
}
```

---

### 40. Get Order Reviews
**Endpoint**: `GET /reviews-svc/v1/reviews`

**Purpose**: Get reviews submitted by user for an order

**Query Parameters**:
- `page`: 1
- `limit`: 10
- `status`: "active"
- `language`: "en"
- `is_product_review`: 1
- `order_id`: Order ID

**Response**: Same structure as product reviews

---

### 41. Submit Product Review
**Endpoint**: `POST /reviews-svc/v1/reviews`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "product_id": "product_id",
  "order_id": "order_id",
  "overall_rating": 4.5,
  "title": "Great product!",
  "content": "Really enjoyed this, highly recommend",
  "parameterRatings": [
    {
      "parameterId": "param_id",
      "parameterName": "Taste",
      "rating": 5
    },
    {
      "parameterId": "param_id_2",
      "parameterName": "Presentation",
      "rating": 4
    }
  ],
  "images": ["image_url_1", "image_url_2"]
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "reviewId": "review_id",
    "status": "pending" // reviews may need approval
  }
}
```

---

### 42. Get Store Parameters (for reviews)
**Endpoint**: `GET /reviews-svc/v1/reviews/storeParameter`

**Purpose**: Get review parameters/criteria for stores

**Response**:
```json
{
  "data": [
    {
      "parameterId": "param_id",
      "parameterName": "Service",
      "maxRating": 5
    },
    {
      "parameterId": "param_id_2",
      "parameterName": "Ambiance",
      "maxRating": 5
    }
  ]
}
```

---

### 43. Get Store Reviews (User)
**Endpoint**: `GET /reviews-svc/v1/reviews/storeReview/user`

**Purpose**: Get store reviews submitted by user

**Query Parameters**:
- `order_id`: Order ID
- `skip`: 0
- `limit`: 10

**Response**: Similar to product reviews structure

---

### 44. Get Store Reviews (Homepage)
**Endpoint**: `GET /reviews-svc/v1/reviews/storeReview/store`

**Purpose**: Get store reviews for display

**Query Parameters**:
- `limit`: Number of reviews (optional)
- `skip`: Pagination offset (optional)

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "overallrating": {
      "average": 4.5,
      "rating": 4.5,
      "totalReview": 256,
      "percentages": {
        "5": 65.0,
        "4": 20.0
      },
      "starDistribution": {
        "5": 166,
        "4": 51
      },
      "parameterRatings": [
        {
          "parameterName": "Service",
          "avgRating": 4.6
        },
        {
          "parameterName": "Ambiance",
          "avgRating": 4.4
        }
      ]
    },
    "reviews": [
      {
        "overall_rating": 5,
        "user_firstname": "Jane",
        "user_lastname": "Smith",
        "content": "Excellent service and food!",
        "daysAgo": "2 days ago",
        "updated_at": "2024-12-03T10:00:00Z"
      }
    ],
    "totalReviews": 256
  }
}
```

---

### 45. Get Customer Reviews (Testimonials)
**Endpoint**: `GET /reviews-svc/v1/reviews/storeReview`

**Purpose**: Get customer testimonials/featured reviews

**Headers**:
```json
{
  "Authorization": "Bearer ACCESS_TOKEN" // optional
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "review_id",
      "user_firstname": "John",
      "user_lastname": "Doe",
      "overall_rating": 5,
      "content": "Amazing experience!",
      "title": "Best restaurant ever",
      "user_profilepic": "avatar_url",
      "order_id": "order_id",
      "created_at": "2024-12-05T14:30:00Z",
      "status": "active"
    }
  ]
}
```

**Cache Strategy**: Cached for 5 minutes on client

---

### 46. Submit Store Review
**Endpoint**: `POST /reviews-svc/v1/reviews/storeReview`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "order_id": "order_id",
  "overall_rating": 4.5,
  "title": "Great experience!",
  "content": "Loved the ambiance and service",
  "parameterRatings": [
    {
      "parameterId": "param_id",
      "parameterName": "Service",
      "rating": 5
    },
    {
      "parameterId": "param_id_2",
      "parameterName": "Ambiance",
      "rating": 4
    }
  ]
}
```

---

## User Profile

### 47. Update Profile
**Endpoint**: `PATCH /e-commerce/v1/tenant/customer`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "countryCode": "+1",
  "phoneIsoCode": "US"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "phone": "1234567890",
    "countryCode": "+1"
  }
}
```

---

### 48. Request Email Update (Send OTP)
**Endpoint**: `GET /e-commerce/v1/tenant/customer/update/email`

**Purpose**: Request OTP to update email

**Query Parameters**:
- `email`: New email address

**Response**:
```json
{
  "status": "success",
  "message": "OTP sent to new email address"
}
```

---

### 49. Verify Email Update (Confirm OTP)
**Endpoint**: `PATCH /e-commerce/v1/tenant/customer`

**Purpose**: Confirm email update with OTP

**Request Body**:
```json
{
  "email": "newemail@example.com",
  "otp": "123456"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "email": "newemail@example.com"
  }
}
```

---

## Wishlist

### 50. Get Wishlist
**Endpoint**: `GET /e-commerce/v1/tenant/wishlist`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Query Parameters** (all optional):
- `productID`: Filter by specific product
- `limit`: Number of items per page
- `offset`: Pagination offset

**Response**:
```json
{
  "data": [
    {
      "id": "wishlist_item_id",
      "productId": "product_id",
      "productName": "Burger",
      "productSlug": "burger",
      "basePrice": 12.99,
      "discountedPrice": 9.99,
      "image": "product_image_url",
      "categoryName": "Main Course",
      "isAvailable": true,
      "addedAt": "2024-12-05T14:30:00Z"
    }
  ],
  "totalCount": 15
}
```

---

### 51. Add to Wishlist
**Endpoint**: `POST /e-commerce/v1/tenant/wishlist`

**Headers**:
```json
{
  "Store-Id": "STORE_ID",
  "X-User-Location": "JSON_STRINGIFIED_LOCATION_DATA"
}
```

**Request Body**:
```json
{
  "productId": "product_id"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "wishlistItemId": "item_id",
    "productId": "product_id"
  }
}
```

---

### 52. Remove from Wishlist
**Endpoint**: `DELETE /e-commerce/v1/tenant/wishlist`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Query Parameters**:
- `productId`: Product ID to remove

**Response**:
```json
{
  "status": "success",
  "message": "Product removed from wishlist"
}
```

---

## Offers & Promotions

### 53. Get Offers
**Endpoint**: `GET /e-commerce/v1/tenant/offer`

**Purpose**: Get active offers/promotions

**Query Parameters** (all optional):
- `storeSlug`: Filter by store
- `categorySlug`: Filter by category
- `menuSlug`: Filter by menu

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "offer_id",
      "name": {
        "en": "Buy 1 Get 1 Free"
      },
      "description": {
        "en": "Get one free burger with purchase"
      },
      "offerType": "bogo", // or "percentage", "fixed", "bundle"
      "discountType": "percentage",
      "discountValue": 50,
      "minimumSpendValue": 20.00,
      "maxDiscount": 10.00,
      "validFrom": "2024-12-01T00:00:00Z",
      "validUntil": "2024-12-31T23:59:59Z",
      "applicableProducts": ["product_id_1", "product_id_2"],
      "applicableCategories": ["category_id"],
      "priority": 1,
      "status": "active",
      "termsAndConditions": "Terms apply"
    }
  ],
  "totalCount": 5
}
```

---

## Search & Recent Search

### 54. Post Recent Search
**Endpoint**: `POST /e-commerce/v1/tenant/recentSearch`

**Purpose**: Save user's search query

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Request Body**:
```json
{
  "searchQuery": "burger",
  "menuId": "menu_id" // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "search_id",
    "searchQuery": "burger"
  }
}
```

---

### 55. Get Recent Search Suggestions
**Endpoint**: `GET /e-commerce/v1/tenant/recentSearch`

**Purpose**: Get user's recent searches

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Query Parameters**:
- `skip`: 0 (default)
- `limit`: 10 (default)
- `menuId`: Filter by menu (optional)
- `q`: Search term filter (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "search_id",
      "searchQuery": "burger",
      "menuId": "menu_id",
      "createdAt": "2024-12-05T14:30:00Z"
    }
  ]
}
```

---

### 56. Delete Recent Search
**Endpoint**: `DELETE /e-commerce/v1/tenant/recentSearch`

**Headers**:
```json
{
  "Store-Id": "STORE_ID"
}
```

**Query Parameters**:
- `id`: Search ID to delete

**Response**:
```json
{
  "success": true,
  "message": "Search deleted successfully"
}
```

---

## Events

### 57. Get Events
**Endpoint**: `GET /e-commerce/v1/tenant/event`

**Purpose**: Get list of events (promotions, special occasions, etc.)

**Response**:
```json
{
  "data": [
    {
      "id": "event_id",
      "title": "Holiday Special",
      "description": "Special menu for the holidays",
      "image": "event_image_url",
      "startDate": "2024-12-20T00:00:00Z",
      "endDate": "2024-12-26T23:59:59Z",
      "isActive": true,
      "eventType": "promotion" // or "special_menu", "announcement"
    }
  ]
}
```

---

### 58. Get Event Details
**Endpoint**: `GET /e-commerce/v1/tenant/event`

**Purpose**: Get details for a specific event

**Query Parameters**:
- `id`: Event ID

**Response**:
```json
{
  "data": {
    "id": "event_id",
    "title": "Holiday Special",
    "description": "Detailed description...",
    "image": "event_image_url",
    "startDate": "2024-12-20T00:00:00Z",
    "endDate": "2024-12-26T23:59:59Z",
    "specialMenu": {
      "menuId": "special_menu_id",
      "products": [...]
    },
    "offers": [...]
  }
}
```

---

## File Upload

### 59. Get Presigned URL for Upload
**Endpoint**: `POST /e-commerce/v1/upload/multiple`

**Purpose**: Get S3 presigned URL for file upload (images, documents)

**Request Body**:
```json
{
  "files": [
    {
      "fileName": "profile-pic.jpg",
      "fileType": "image/jpeg",
      "fileSize": 102400
    },
    {
      "fileName": "review-photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 204800
    }
  ],
  "uploadType": "profile" // or "review", "document"
}
```

**Response**:
```json
{
  "data": [
    {
      "fileName": "profile-pic.jpg",
      "uploadUrl": "https://s3.amazonaws.com/bucket/path?signature=...",
      "fileUrl": "https://cdn.example.com/uploads/profile-pic.jpg",
      "expiresIn": 3600
    },
    {
      "fileName": "review-photo.jpg",
      "uploadUrl": "https://s3.amazonaws.com/bucket/path?signature=...",
      "fileUrl": "https://cdn.example.com/uploads/review-photo.jpg",
      "expiresIn": 3600
    }
  ]
}
```

**Upload Process**:
1. Call this API to get presigned URL
2. Use `uploadUrl` to PUT/POST the file directly to S3
3. Use `fileUrl` in subsequent API calls (e.g., review submission)

**Example Upload**:
```javascript
// After getting presigned URL
const file = /* your file blob */;
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': 'image/jpeg'
  }
});
// Then use fileUrl in your review/profile API call
```

---

## Page Management

### 60. Get Page Draft
**Endpoint**: `GET /e-commerce/v1/pages`

**Purpose**: Get CMS page content (for dynamic pages)

**Query Parameters**:
- `pageSlug`: Page slug (e.g., "home", "about-us")
- `isDraft`: "true" or "false"

**Headers**:
```json
{
  "Authorization": "Bearer ACCESS_TOKEN"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "type": "Hero",
        "props": {
          "title": "Welcome",
          "image": "hero_image_url"
        }
      },
      {
        "type": "ProductGrid",
        "props": {
          "products": [...]
        }
      }
    ],
    "root": {
      "title": "Homepage"
    }
  }
}
```

**Special Response**:
- **204 No Content**: No draft/page data exists (valid response, not an error)

---

### 61. Publish Page Draft
**Endpoint**: `PATCH /e-commerce/v1/pages`

**Purpose**: Update CMS page content (admin only)

**Request Body**:
```json
{
  "data": [...], // page content array
  "pageSlug": "home",
  "isDraft": true
}
```

---

## Location Services

### 62. Get Address from Coordinates (Reverse Geocoding)
**External API**: `GET https://nominatim.openstreetmap.org/reverse`

**Query Parameters**:
- `lat`: Latitude
- `lon`: Longitude
- `format`: "json"
- `addressdetails`: 1

**Response**:
```json
{
  "place_id": 123456,
  "lat": "40.7128",
  "lon": "-74.0060",
  "display_name": "123 Main St, New York, NY 10001, USA",
  "address": {
    "road": "Main St",
    "house_number": "123",
    "city": "New York",
    "state": "New York",
    "postcode": "10001",
    "country": "United States"
  }
}
```

---

### 63. Search Address
**External API**: `GET https://nominatim.openstreetmap.org/search`

**Query Parameters**:
- `format`: "json"
- `addressdetails`: 1
- `q`: Search query (encoded)
- `viewbox`: Bounding box (optional) - "minLon,minLat,maxLon,maxLat"
- `bounded`: 1 (optional, restricts results to viewbox)

**Response**:
```json
[
  {
    "place_id": 123456,
    "lat": "40.7128",
    "lon": "-74.0060",
    "display_name": "123 Main St, New York, NY, USA",
    "address": {
      "road": "Main St",
      "city": "New York",
      "state": "New York",
      "country": "United States"
    }
  }
]
```

---

### 64. Search Address by Zipcode
**External API**: `GET https://nominatim.openstreetmap.org/search`

**Query Parameters**:
- `format`: "json"
- `q`: Zipcode (encoded)

**Response**: Same as Search Address

---

### 65. Get IP Information
**External API**: `GET https://ipinfo.io`

**Query Parameters**:
- `token`: "10ff35cdc096c5" (API token)

**Response**:
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "loc": "37.4056,-122.0775",
  "timezone": "America/Los_Angeles"
}
```

---

### 66. Get User Location (IP-based)
**External API**: `GET https://ipapi.co/json/`

**Purpose**: Fallback location detection

**Response**:
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "timezone": "America/Los_Angeles"
}
```

---

## Common Headers & Configuration

### X-User-Location Header Format

The `X-User-Location` header should contain JSON stringified location data:

```json
{
  "ip": "192.168.1.1",
  "city": "New York",
  "country": "US",
  "os": "android", // or "ios", "windows", "mac", "linux"
  "device": "mobile", // or "tablet", "desktop", "iphone", "ipad"
  "browser": "chrome", // or "safari", "firefox", "edge"
  "lat": 40.7128,
  "lng": -74.0060,
  "source": "mobile", // "mobile" for mobile apps, "web" for web
  "internalTrigger": "add-to-cart" // action that triggered the request
}
```

**Internal Trigger Values** (for tracking):
- Authentication: `"login-email"`, `"login-email-otp"`, `"signup"`, `"google-auth"`
- Cart: `"cart-update"`, `"cart-add-combo"`, `"cart-cancel-order"`, `"add-to-cart"`, `"patch-cart"`
- Checkout: `"checkout"`
- Wishlist: `"add-to-wishlist"`
- Product: `"get-product-details"`
- And more...

### Error Handling

All API errors follow this format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Common Status Codes**:
- **200**: Success
- **201**: Created
- **204**: No Content (valid response with no body)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (token expired or invalid)
- **403**: Forbidden (access denied)
- **404**: Not Found
- **406**: Not Acceptable (token needs refresh)
- **500**: Internal Server Error

### Token Refresh Flow

1. **Initial Request**: Include `Authorization: Bearer ACCESS_TOKEN`
2. **401/406 Response**: Token expired/invalid
3. **Refresh Token**: Call refresh token endpoint with refresh token
4. **Retry Request**: Use new access token
5. **If Refresh Fails**: Generate new guest token
6. **If 403**: Clear all tokens and re-authenticate

### Automatic Request Interceptor Logic

The web app uses axios interceptors that handle:
- **Auto-attach Authorization**: Automatically adds token to all requests
- **Token Refresh**: Automatically refreshes token on 401/406
- **Request Queuing**: Queues requests during token refresh
- **Guest Token Generation**: Falls back to guest token if user token fails

Mobile app should implement similar logic.

### Caching Strategy

**Client-side caching recommendations**:
- **Page Config**: 15 minutes
- **Store Data**: 5 minutes (location-based)
- **Product Data**: 10 minutes
- **Cart**: No cache (always fresh)
- **Orders**: 5 minutes
- **Reviews**: 5 minutes
- **Customer Reviews**: 5 minutes

### Rate Limiting

No specific rate limits documented, but implement:
- **Request deduplication**: Don't send duplicate requests simultaneously
- **Exponential backoff**: On errors, retry with increasing delays
- **Request throttling**: Limit rapid successive requests

---

## TypeSense Search API (Optional)

The web app uses TypeSense for product search, but it's client-side. Mobile apps can either:
1. Use TypeSense directly (requires TypeSense SDK)
2. Use the regular product APIs listed above

If using TypeSense:

**Configuration**:
- Collection: `products_{tenantId}_{storeId}`
- Search fields: `name`, `description`, `productCategoryName.en`

**Search Parameters**:
```javascript
{
  q: "search query",
  query_by: "name,description,productCategoryName.en",
  filter_by: "categoryId:=category_id && isAvailable:=true",
  sort_by: "basePrice:asc", // or "basePrice:desc", "name:asc"
  page: 1,
  per_page: 20,
  facet_by: "categoryId,brandName",
  max_facet_values: 10
}
```

---

## About Us / Team Members

### 67. Get Team Members (Client)
**Endpoint**: `GET /e-commerce/v1/teamMembers`

**Purpose**: Get team members for About Us page

**Response**:
```json
{
  "data": [
    {
      "id": "member_id",
      "name": "John Doe",
      "position": "Head Chef",
      "bio": "20 years of culinary experience",
      "image": "profile_image_url",
      "socialMedia": {
        "linkedin": "linkedin_url",
        "twitter": "twitter_url"
      }
    }
  ],
  "totalCount": 5
}
```

**Special Response**:
- **204 No Content**: No team members configured (valid response)

---

## Summary of Key Points

### Must-Have Headers
1. **All requests**: `Tenant-Id`
2. **Authenticated requests**: `Authorization: Bearer ACCESS_TOKEN`
3. **Store-specific requests**: `Store-Id`
4. **Location-aware requests**: `X-User-Location` (JSON stringified)

### Critical Flows

**Authentication Flow**:
1. Generate guest token on app launch
2. Store access + refresh tokens
3. Auto-refresh on 401/406
4. User login replaces guest token with user token
5. Token exchange when switching stores

**Order Flow**:
1. Browse products → Add to cart
2. View cart → Calculate delivery fee
3. Select/add address → Get promotions
4. Checkout → Create payment intent
5. Complete payment → Get order confirmation
6. Track order → View order details
7. Submit review after delivery

**Product Discovery Flow**:
1. Get stores by location
2. Get store categories
3. Get products by category
4. View product details
5. Add to wishlist/cart

### Performance Tips
1. **Implement caching** for static data (categories, stores, etc.)
2. **Request deduplication** - don't make duplicate concurrent requests
3. **Optimize images** - use thumbnail URLs when available
4. **Pagination** - use limit/offset for large lists
5. **Background refresh** - refresh tokens in background before expiry

### Security Best Practices
1. **Never log sensitive data** (tokens, passwords)
2. **Secure token storage** - use secure storage APIs
3. **HTTPS only** - all requests over HTTPS
4. **Token rotation** - refresh tokens periodically
5. **Clear tokens on logout** - remove all auth data

---

## Testing Checklist

- [ ] Guest authentication works
- [ ] Token refresh works automatically
- [ ] User signup/login works
- [ ] Store selection based on location
- [ ] Product browsing and search
- [ ] Add to cart (simple + combo products)
- [ ] Cart update/remove items
- [ ] Address management (add/edit/delete)
- [ ] Delivery fee calculation
- [ ] Promo code application
- [ ] Checkout and order placement
- [ ] Payment integration
- [ ] Order tracking
- [ ] Order cancellation
- [ ] Reorder functionality
- [ ] Product reviews submission
- [ ] Store reviews submission
- [ ] Wishlist add/remove
- [ ] Profile update
- [ ] Email update with OTP
- [ ] Image upload for reviews
- [ ] Recent search functionality
- [ ] Events/promotions display
- [ ] Error handling for all APIs
- [ ] Offline mode handling
- [ ] Token expiry handling

---

## Contact & Support

For API issues or questions:
- Check response error messages
- Verify all required headers are included
- Ensure tokens are valid and not expired
- Check request payload matches documentation
- Verify Store-Id is correct for store-specific endpoints

---

*Last Updated: December 2024*
*Version: 1.0*

