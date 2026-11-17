# PlateAway API Documentation

> Comprehensive API documentation for PlateAway e-commerce platform - designed for mobile app developers, backend integrators, and frontend teams.

---

## 🗺️ Not Sure Where to Start?

**Quick Navigation**:
- **[📑 Endpoint Index](./INDEX.md)** - Jump to any endpoint in 3 clicks or less!
- **[🗺️ Documentation Map](./DOCUMENTATION_MAP.md)** - Visual guide with flowcharts to find what you need
- **Continue reading below** - Complete documentation overview

---

## 📚 Documentation Structure

This folder contains four interconnected API documentation files, each serving a specific purpose:

### 1. 📖 [API Documentation](./API_DOCUMENTATION.md) - Complete Reference
**Purpose**: Detailed reference for all API endpoints

**What's Inside**:
- 67+ API endpoints with full specifications
- Complete request/response examples
- All headers, query parameters, and payloads
- Authentication flows (Guest, User, OAuth)
- Error handling and status codes
- Security best practices
- Caching strategies
- Testing checklist

**Best For**: 
- Looking up specific endpoint details
- Understanding request/response formats
- Finding authentication requirements
- Implementing security measures

**Quick Links**:
- [Authentication & Token Management](./API_DOCUMENTATION.md#authentication--token-management)
- [Store & Menu APIs](./API_DOCUMENTATION.md#store--menu-apis)
- [Product APIs](./API_DOCUMENTATION.md#product-apis)
- [Cart Management](./API_DOCUMENTATION.md#cart-management)
- [Checkout & Address](./API_DOCUMENTATION.md#checkout--address)
- [Order Management](./API_DOCUMENTATION.md#order-management)
- [Payment APIs](./API_DOCUMENTATION.md#payment-apis)
- [Reviews & Ratings](./API_DOCUMENTATION.md#reviews--ratings)

---

### 2. ⚡ [API Quick Reference](./API_QUICK_REFERENCE.md) - Cheat Sheet
**Purpose**: Fast lookup and quick integration guide

**What's Inside**:
- API endpoints organized by category (table format)
- Critical flows (auth, order, token refresh)
- Header requirements matrix
- Response codes and actions
- Caching strategy table
- Integration priority phases
- Mobile-specific code examples

**Best For**:
- Quick endpoint lookup
- Understanding API categories
- Finding header requirements
- Planning integration phases
- Getting code snippets

**Quick Links**:
- [Authentication APIs (9)](./API_QUICK_REFERENCE.md#-authentication-9-apis)
- [Store & Menu (4)](./API_QUICK_REFERENCE.md#-store--menu-4-apis)
- [Products (4)](./API_QUICK_REFERENCE.md#-products-4-apis)
- [Cart Management (6)](./API_QUICK_REFERENCE.md#-cart-management-6-apis)
- [Checkout & Address (7)](./API_QUICK_REFERENCE.md#-checkout--address-7-apis)
- [Integration Priority](./API_QUICK_REFERENCE.md#-integration-priority-for-mobile)

---

### 3. 📄 [API Pages Mapping](./API_PAGES_MAPPING.md) - Screen-by-Screen Guide
**Purpose**: Map APIs to specific screens/pages in the application

**What's Inside**:
- 17 page/section categories
- APIs called on each page
- When each API is triggered
- Complete user flows
- Page-specific examples
- API call sequences

**Best For**:
- Implementing specific screens
- Understanding page lifecycle
- Finding all APIs for a feature
- Planning screen development
- Understanding user journeys

**Quick Links**:
- [General/Global APIs](./API_PAGES_MAPPING.md#1-general--global-apis)
- [Homepage](./API_PAGES_MAPPING.md#2-homepage)
- [Product Listing Page](./API_PAGES_MAPPING.md#4-product-listing-page-plp--category)
- [Product Detail Page](./API_PAGES_MAPPING.md#5-product-detail-page-pdp)
- [Cart Page](./API_PAGES_MAPPING.md#6-cart-page)
- [Checkout Page](./API_PAGES_MAPPING.md#7-checkout-page)
- [Orders Page](./API_PAGES_MAPPING.md#8-orders-page-order-history)
- [Complete Order Flow](./API_PAGES_MAPPING.md#-api-call-flow-examples)

---

### 4. 🔔 [API Modals/Dialogs Mapping](./API_MODALS_DIALOGS_MAPPING.md) - Modal Reference
**Purpose**: Document APIs called from modals, dialogs, and bottom sheets

**What's Inside**:
- 25+ modals/dialogs documented
- APIs called within each modal
- Modal trigger points
- Nested modal hierarchies
- Modal flow diagrams
- Success/error handling

**Best For**:
- Implementing modals/dialogs
- Understanding modal interactions
- Planning modal stacking
- Finding modal-specific APIs
- Error handling in modals

**Quick Links**:
- [Authentication Modals](./API_MODALS_DIALOGS_MAPPING.md#1-authentication-modals)
- [Cart & Product Modals](./API_MODALS_DIALOGS_MAPPING.md#2-cart--product-modals)
- [Checkout & Address Modals](./API_MODALS_DIALOGS_MAPPING.md#3-checkout--address-modals)
- [Review & Rating Modals](./API_MODALS_DIALOGS_MAPPING.md#6-review--rating-modals)
- [Modal Flow Diagrams](./API_MODALS_DIALOGS_MAPPING.md#-modal-flow-diagrams)

---

## 🚀 Getting Started

### For First-Time Integration

1. **Start Here**: [API Quick Reference](./API_QUICK_REFERENCE.md)
   - Understand the API structure
   - Review integration phases
   - Note header requirements

2. **Authentication**: [API Documentation - Auth Section](./API_DOCUMENTATION.md#authentication--token-management)
   - Implement guest authentication
   - Set up token refresh
   - Handle user login

3. **Pick a Screen**: [API Pages Mapping](./API_PAGES_MAPPING.md)
   - Find your screen (e.g., Homepage, PDP, Cart)
   - Implement all APIs for that screen
   - Follow the documented flows

4. **Add Modals**: [API Modals Mapping](./API_MODALS_DIALOGS_MAPPING.md)
   - Implement modals for your screen
   - Handle nested modals
   - Add error handling

---

## 🔍 How to Find What You Need

### By Use Case

| What You Need | Where to Look |
|---------------|---------------|
| **Endpoint details** | [API Documentation](./API_DOCUMENTATION.md) |
| **Quick lookup** | [API Quick Reference](./API_QUICK_REFERENCE.md) |
| **Screen implementation** | [API Pages Mapping](./API_PAGES_MAPPING.md) |
| **Modal implementation** | [API Modals Mapping](./API_MODALS_DIALOGS_MAPPING.md) |
| **Auth flow** | [API Documentation - Auth](./API_DOCUMENTATION.md#authentication--token-management) |
| **Order flow** | [Pages Mapping - Order Flow](./API_PAGES_MAPPING.md#complete-order-flow) |
| **Cart operations** | [API Documentation - Cart](./API_DOCUMENTATION.md#cart-management) |
| **Header requirements** | [Quick Reference - Headers](./API_QUICK_REFERENCE.md#-header-requirements-by-endpoint-type) |
| **Error codes** | [API Documentation - Errors](./API_DOCUMENTATION.md#common-headers--configuration) |
| **Integration priority** | [Quick Reference - Priority](./API_QUICK_REFERENCE.md#-integration-priority-for-mobile) |

---

## 📊 Documentation Statistics

- **Total Endpoints**: 67+
- **External Services**: 4 (OpenStreetMap, IPInfo, IPApi, TypeSense)
- **Authentication Methods**: 3 (Guest, Email OTP, Google OAuth)
- **Pages Documented**: 17
- **Modals Documented**: 25+
- **Complete Examples**: 100+
- **API Categories**: 16

---

## 🎯 Common Integration Flows

### 1. User Registration & Login
```
Step 1: Guest Token
  └─> API Documentation: Guest Authentication
  
Step 2: User Signup
  └─> Modals Mapping: Signup Modal
  └─> API: POST /tenant/customer/signup
  
Step 3: Verify Phone
  └─> API: POST /tenant/customer/validate/phone
```
📖 **See**: [Authentication Modals](./API_MODALS_DIALOGS_MAPPING.md#1-authentication-modals)

---

### 2. Browse & Add to Cart
```
Step 1: Get Stores
  └─> Pages Mapping: Homepage
  └─> API: GET /tenant/store
  
Step 2: Browse Category
  └─> Pages Mapping: Product Listing
  └─> API: TypeSense Search
  
Step 3: View Product
  └─> Pages Mapping: Product Detail Page
  └─> API: GET /tenant/product
  
Step 4: Add to Cart
  └─> API: POST /tenant/cart
```
📖 **See**: [Complete Order Flow](./API_PAGES_MAPPING.md#complete-order-flow)

---

### 3. Checkout & Payment
```
Step 1: Select Address
  └─> Modals Mapping: Add Address Modal
  └─> API: POST /tenant/customer/address
  
Step 2: Calculate Delivery
  └─> Pages Mapping: Checkout Page
  └─> API: GET /order/calculateDeliveryFee
  
Step 3: Place Order
  └─> API: POST /tenant/order
  
Step 4: Process Payment
  └─> Modals Mapping: Payment Modal
  └─> API: POST /payments/intent
```
📖 **See**: [Checkout Page](./API_PAGES_MAPPING.md#7-checkout-page)

---

## 🔐 Security & Best Practices

### Essential Security Measures

1. **Token Management**
   - Store tokens securely (Keychain/KeyStore)
   - Implement auto-refresh before expiry
   - Handle 401/406 gracefully
   - 📖 See: [Token Refresh Flow](./API_QUICK_REFERENCE.md#token-refresh-flow)

2. **Header Requirements**
   - Always include `Tenant-Id`
   - Add `Store-Id` for store-specific operations
   - Include `X-User-Location` for write operations
   - 📖 See: [Header Requirements](./API_QUICK_REFERENCE.md#-header-requirements-by-endpoint-type)

3. **Error Handling**
   - Implement retry logic with exponential backoff
   - Show user-friendly error messages
   - Log errors for debugging
   - 📖 See: [Error Handling](./API_DOCUMENTATION.md#common-headers--configuration)

4. **Performance**
   - Implement client-side caching
   - Use request deduplication
   - Optimize image loading
   - 📖 See: [Caching Strategy](./API_QUICK_REFERENCE.md#-caching-strategy)

---

## 🛠️ Integration Phases

### Phase 1: Essential (Weeks 1-2)
✅ Guest Authentication  
✅ Token Refresh  
✅ Get Stores  
✅ Get Products  
✅ Add to Cart  
✅ Place Order  

📖 **See**: [Integration Priority](./API_QUICK_REFERENCE.md#-integration-priority-for-mobile)

### Phase 2: Core Features (Weeks 3-4)
✅ Login/Signup  
✅ Product Search  
✅ Address Management  
✅ Order History  

### Phase 3: Enhanced (Weeks 5-6)
✅ Payment Integration  
✅ Reviews & Ratings  
✅ Wishlist  
✅ Reorder  

### Phase 4: Polish (Week 7+)
✅ Events  
✅ Offers/Promotions  
✅ Profile Management  
✅ Advanced Features  

---

## 📱 Mobile-Specific Considerations

### React Native / Flutter / Native Apps

1. **Token Storage**
   ```javascript
   // Use secure storage
   import SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('access_token', token);
   ```

2. **Location Header**
   ```javascript
   const locationHeader = {
     ip: await getDeviceIP(),
     city: await getCity(),
     country: await getCountry(),
     os: Platform.OS, // 'ios' or 'android'
     device: 'mobile',
     browser: 'app',
     lat: location.latitude,
     lng: location.longitude,
     source: 'mobile',
     internalTrigger: actionName
   };
   ```

3. **Request Interceptor**
   - Auto-attach tokens
   - Handle token refresh
   - Queue requests during refresh
   - 📖 See: [Axios Interceptor Pattern](./API_DOCUMENTATION.md#automatic-request-interceptor-logic)

---

## 🧪 Testing Your Integration

### Checklist

- [ ] Guest authentication works on app launch
- [ ] Token refresh handles 401/406 correctly
- [ ] User can login with OTP
- [ ] User can signup successfully
- [ ] Products load with search/filters
- [ ] Add to cart works (simple + combo)
- [ ] Cart updates/removes items correctly
- [ ] Address CRUD operations work
- [ ] Delivery fee calculates correctly
- [ ] Order placement succeeds
- [ ] Payment integration completes
- [ ] Order history displays correctly
- [ ] Reviews can be submitted
- [ ] Wishlist add/remove works
- [ ] Error handling shows proper messages
- [ ] Offline mode handled gracefully

📖 **See**: [Testing Checklist](./API_DOCUMENTATION.md#testing-checklist)

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: 401 Unauthorized  
**Solution**: Refresh token or generate new guest token  
📖 [Token Refresh](./API_QUICK_REFERENCE.md#token-refresh-flow)

**Issue**: 403 Forbidden  
**Solution**: Clear all tokens and re-authenticate  
📖 [Error Handling](./API_DOCUMENTATION.md#error-handling)

**Issue**: Missing Store-Id  
**Solution**: Ensure Store-Id header for store-specific APIs  
📖 [Headers](./API_QUICK_REFERENCE.md#-header-requirements-by-endpoint-type)

**Issue**: Token expired  
**Solution**: Implement auto-refresh with 5-minute buffer  
📖 [Token Management](./API_DOCUMENTATION.md#token-refresh-flow)

---

## 🔄 Document Updates

These documents are living documentation. When APIs change:

1. Update the relevant section in [API Documentation](./API_DOCUMENTATION.md)
2. Update the quick reference in [API Quick Reference](./API_QUICK_REFERENCE.md)
3. Update page mapping if screen flow changes in [Pages Mapping](./API_PAGES_MAPPING.md)
4. Update modal mapping if dialog APIs change in [Modals Mapping](./API_MODALS_DIALOGS_MAPPING.md)

---

## 📞 Support & Questions

For API-related questions:

1. **Check the docs** - Use the search/lookup tables above
2. **Review examples** - All docs have complete request/response examples
3. **Check error messages** - API responses include helpful error details
4. **Test with tools** - Use Postman/Insomnia to test endpoints first

---

## 🎓 Additional Resources

### Related Documentation
- [Breadcrumb Schema](../BREADCRUMB_SCHEMA.md)
- [Static Generation](../STATIC_GENERATION.md)
- [Logging Guide](../LOGGING.md)
- [Page Management](../PAGE_MANAGEMENT_API.md)
- [Sitemap Setup](../SITEMAP_SETUP.md)

### External Services
- [OpenStreetMap Nominatim API](https://nominatim.org/release-docs/develop/api/Overview/)
- [Stripe Payment API](https://stripe.com/docs/api)
- [TypeSense Search](https://typesense.org/docs/)

---

## 📈 Version History

- **v1.0** (December 2024) - Initial comprehensive API documentation
  - 67+ endpoints documented
  - 17 pages mapped
  - 25+ modals documented
  - Complete integration guide

---

**Last Updated**: December 2024  
**Maintained By**: PlateAway Development Team  
**For**: Mobile App Development, Backend Integration, Frontend Teams

