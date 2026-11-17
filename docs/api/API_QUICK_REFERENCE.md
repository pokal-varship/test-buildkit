# PlateAway API Quick Reference

> **📚 Documentation Navigation**  
> **You are here**: Quick Reference Guide  
> **See also**: [Complete API Docs](./API_DOCUMENTATION.md) | [Page Mapping](./API_PAGES_MAPPING.md) | [Modal Mapping](./API_MODALS_DIALOGS_MAPPING.md) | [API Docs Home](./README.md)

---

## 🚀 Quick Start

### Base Configuration
```
BASE_URL: process.env.NEXT_PUBLIC_API_URL
TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID
```

### Essential Headers
```json
{
  "Tenant-Id": "YOUR_TENANT_ID",
  "Authorization": "Bearer ACCESS_TOKEN",
  "Store-Id": "STORE_ID",
  "X-User-Location": "{\"ip\":\"...\",\"city\":\"...\",\"lat\":...,\"lng\":...}"
}
```

---

## 📋 API Endpoints by Category

### 🔐 Authentication (9 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/e-commerce/v1/tenant/customer/guest-auth` | Get guest token |
| GET | `/e-commerce/v1/refreshToken` | Refresh access token |
| POST | `/e-commerce/v1/tenant/customer/loginWithOtp` | Request login OTP |
| PATCH | `/e-commerce/v1/tenant/customer/loginWithOtp` | Verify login OTP |
| POST | `/e-commerce/v1/tenant/customer/signup` | User registration |
| POST | `/e-commerce/v1/tenant/customer/validate/phone` | Validate phone |
| POST | `/e-commerce/v1/googleAuth/food` | Google OAuth login |
| GET | `/e-commerce/v1/tenant/customer/tokenExchange` | Exchange token for store |
| POST | `/e-commerce/v1/logout` | Logout user |

### 🏪 Store & Menu (4 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/config` | Get page configuration |
| GET | `/e-commerce/v1/tenant/store` | Get stores by location |
| GET | `/e-commerce/v1/tenant/menu/categories` | Get menu categories |
| GET | `/e-commerce/v1/tenant/products` | Get products list |

### 📦 Products (4 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/product` | Get product/combo details |
| GET | `/e-commerce/v1/tenant/product/popular-products` | Get popular products |
| GET | `/e-commerce/v1/tenant/product/getStores` | Get product availability |

### 🛒 Cart Management (6 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/cart` | Get cart |
| POST | `/e-commerce/v1/tenant/cart` | Add to cart |
| PATCH | `/e-commerce/v1/tenant/cart` | Update cart / Cancel |
| GET | `/e-commerce/v1/tenant/cart/upsell-products` | Get upsell items |
| GET | `/e-commerce/v1/tenant/cart/freebie-offer` | Get freebies |

### 📍 Checkout & Address (7 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/customer/address` | Get addresses |
| POST | `/e-commerce/v1/tenant/customer/address` | Add address |
| PATCH | `/e-commerce/v1/tenant/customer/address` | Update address |
| DELETE | `/e-commerce/v1/tenant/customer/address` | Delete address |
| GET | `/e-commerce/v1/tenant/order/calculateDeliveryFee` | Calculate delivery |
| GET | `/promo-svc/v1/user/promotions/list` | Get promotions |
| POST | `/e-commerce/v1/tenant/order` | Place order |

### 📋 Order Management (5 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/order` | Get all orders |
| GET | `/e-commerce/v1/tenant/order?orderId=` | Get order by ID |
| GET | `/e-commerce/v1/cancellation/reason` | Get cancel reasons |
| PATCH | `/e-commerce/v1/tenant/order/cancel` | Cancel order |
| GET | `/e-commerce/v1/tenant/order/reorder` | Get reorder items |

### 💳 Payment (2 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/integration-svc/v1/payments/intent` | Create payment intent |
| POST | `/e-commerce/v1/payments/webhook` | Payment webhook |

### ⭐ Reviews & Ratings (9 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/reviews-svc/v1/reviews/productParameter` | Get review params |
| GET | `/reviews-svc/v1/reviews` | Get product reviews |
| POST | `/reviews-svc/v1/reviews` | Submit product review |
| GET | `/reviews-svc/v1/reviews/storeParameter` | Get store params |
| GET | `/reviews-svc/v1/reviews/storeReview/user` | Get user reviews |
| GET | `/reviews-svc/v1/reviews/storeReview/store` | Get store reviews |
| GET | `/reviews-svc/v1/reviews/storeReview` | Get testimonials |
| POST | `/reviews-svc/v1/reviews/storeReview` | Submit store review |

### 👤 User Profile (3 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/e-commerce/v1/tenant/customer` | Update profile |
| GET | `/e-commerce/v1/tenant/customer/update/email` | Request email OTP |
| PATCH | `/e-commerce/v1/tenant/customer` | Verify email OTP |

### ❤️ Wishlist (3 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/wishlist` | Get wishlist |
| POST | `/e-commerce/v1/tenant/wishlist` | Add to wishlist |
| DELETE | `/e-commerce/v1/tenant/wishlist` | Remove from wishlist |

### 🎁 Offers (1 API)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/offer` | Get offers |

### 🔍 Search (3 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/e-commerce/v1/tenant/recentSearch` | Save search |
| GET | `/e-commerce/v1/tenant/recentSearch` | Get recent searches |
| DELETE | `/e-commerce/v1/tenant/recentSearch` | Delete search |

### 🎉 Events (2 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/tenant/event` | Get events |
| GET | `/e-commerce/v1/tenant/event?id=` | Get event details |

### 📤 File Upload (1 API)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/e-commerce/v1/upload/multiple` | Get upload URLs |

### 📄 CMS Pages (2 APIs)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/pages` | Get page content |
| PATCH | `/e-commerce/v1/pages` | Update page |

### 📍 Location (External APIs)
| Service | Endpoint | Purpose |
|---------|----------|---------|
| OpenStreetMap | `nominatim.openstreetmap.org/reverse` | Reverse geocoding |
| OpenStreetMap | `nominatim.openstreetmap.org/search` | Address search |
| IPInfo | `ipinfo.io` | IP location |
| IPApi | `ipapi.co/json/` | IP location fallback |

### 👥 About Us (1 API)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/e-commerce/v1/teamMembers` | Get team members |

---

## 🔄 Critical Flows

### Authentication Flow
```
1. App Launch → Generate Guest Token
2. Store: access_token, refresh_token, clientName
3. User Action → Auto-refresh on 401/406
4. User Login → Replace guest token with user token
5. Switch Store → Token exchange
```

### Order Placement Flow
```
1. Get Stores → Select Store
2. Browse Products → Add to Cart
3. View Cart → Select Address
4. Calculate Delivery → Apply Promo
5. Checkout → Create Payment
6. Complete Payment → Track Order
```

### Token Refresh Flow
```
Request → 401/406 → Refresh Token → Retry
If Refresh Fails → Generate Guest Token → Retry
If 403 → Clear All → Re-authenticate
```

---

## 🎯 Header Requirements by Endpoint Type

### All Endpoints
- ✅ `Tenant-Id`

### Authenticated Endpoints
- ✅ `Tenant-Id`
- ✅ `Authorization`

### Store-Specific Endpoints
- ✅ `Tenant-Id`
- ✅ `Authorization`
- ✅ `Store-Id`

### Location-Aware Endpoints (Write Operations)
- ✅ `Tenant-Id`
- ✅ `Authorization`
- ✅ `Store-Id` (if store-specific)
- ✅ `X-User-Location`

**Location-Aware Endpoints Include**:
- Login/Signup
- Add to Cart
- Update Cart
- Checkout
- Add to Wishlist
- Product Details (read)

---

## 📊 Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Process response |
| 204 | No Content | Valid - no body |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Refresh token |
| 403 | Forbidden | Clear tokens, re-auth |
| 404 | Not Found | Show error |
| 406 | Not Acceptable | Refresh token |
| 500 | Server Error | Show error, retry |

---

## 💾 Caching Strategy

| Data Type | Cache Duration | Notes |
|-----------|----------------|-------|
| Page Config | 15 minutes | Static configuration |
| Store Data | 5 minutes | Location-based |
| Categories | 10 minutes | Rarely changes |
| Products | 10 minutes | Price may change |
| Cart | No cache | Always fresh |
| Orders | 5 minutes | Status updates |
| Reviews | 5 minutes | New reviews |
| Testimonials | 5 minutes | Featured content |

---

## 🔒 Security Checklist

- [ ] Store tokens securely (Keychain/KeyStore)
- [ ] Use HTTPS only
- [ ] Don't log sensitive data
- [ ] Implement certificate pinning
- [ ] Validate server certificates
- [ ] Clear tokens on logout
- [ ] Implement token rotation
- [ ] Handle token expiry gracefully
- [ ] Use secure random for fingerprint
- [ ] Encrypt local storage

---

## 🧪 Testing Endpoints

### Quick Test Sequence
```
1. Guest Auth → Get token
2. Get Stores → Verify location works
3. Get Categories → Verify store access
4. Get Products → Verify data structure
5. Add to Cart → Verify cart creation
6. Get Cart → Verify cart response
7. Update Cart → Verify update works
8. Calculate Delivery → Verify address
9. Checkout → Verify order creation
10. Get Orders → Verify order list
```

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Refresh token or generate new guest token

### Issue: 403 Forbidden  
**Solution**: Clear all tokens and re-authenticate

### Issue: Token expired
**Solution**: Implement auto-refresh before expiry (5 min buffer)

### Issue: Missing Store-Id
**Solution**: Ensure Store-Id header is sent for store-specific APIs

### Issue: Location header missing
**Solution**: Include X-User-Location for write operations

### Issue: 204 No Content on pages API
**Solution**: This is valid - no draft exists, use published content

---

## 📱 Mobile-Specific Considerations

### Token Management
```kotlin
// Store these securely
val accessToken: String
val refreshToken: String
val clientName: String
val tokenExpiry: Long

// Implement auto-refresh
if (System.currentTimeMillis() > tokenExpiry - 300000) {
    refreshToken()
}
```

### Location Header
```kotlin
val locationData = JSONObject().apply {
    put("ip", getDeviceIP())
    put("city", getCity())
    put("country", getCountry())
    put("os", "android") // or "ios"
    put("device", "mobile")
    put("browser", "app")
    put("lat", latitude)
    put("lng", longitude)
    put("source", "mobile")
    put("internalTrigger", actionName)
}

headers["X-User-Location"] = locationData.toString()
```

### Request Deduplication
```kotlin
// Don't make duplicate concurrent requests
val pendingRequests = mutableMapOf<String, Deferred<Response>>()

suspend fun makeRequest(url: String): Response {
    val existing = pendingRequests[url]
    if (existing != null) return existing.await()
    
    val deferred = async { actualRequest(url) }
    pendingRequests[url] = deferred
    
    try {
        return deferred.await()
    } finally {
        pendingRequests.remove(url)
    }
}
```

---

## 📞 Support

For detailed API documentation, see: `API_DOCUMENTATION.md`

For implementation questions:
1. Check response error messages
2. Verify all required headers
3. Validate request payload structure
4. Test with Postman/curl first
5. Check token validity

---

**Total APIs Documented**: 67+ endpoints  
**External Services**: 4 (OpenStreetMap, IPInfo, IPApi, S3)  
**Authentication Methods**: 3 (Guest, Email OTP, Google OAuth)

*Last Updated: December 2024*

