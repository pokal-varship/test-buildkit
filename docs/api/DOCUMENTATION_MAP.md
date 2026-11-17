# 🗺️ PlateAway API Documentation Map

> A visual guide to help you navigate the API documentation efficiently

---

## 📊 Documentation Overview

```
docs/api/
├── README.md (Start Here!)
├── API_DOCUMENTATION.md (2,700+ lines - Complete Reference)
├── API_QUICK_REFERENCE.md (384 lines - Cheat Sheet)
├── API_PAGES_MAPPING.md (1,343 lines - Screen Guide)
└── API_MODALS_DIALOGS_MAPPING.md (1,111 lines - Modal Guide)

Total: ~6,000 lines of comprehensive API documentation
```

---

## 🎯 Which Document Should I Use?

### Use This Flowchart:

```
START HERE
    ↓
Do you need to implement a specific screen?
    ├─ YES → Go to API_PAGES_MAPPING.md
    │         Find your screen (e.g., Cart, Checkout, PDP)
    │         See all APIs for that screen
    │
    └─ NO
        ↓
    Do you need to implement a modal/dialog?
        ├─ YES → Go to API_MODALS_DIALOGS_MAPPING.md
        │         Find your modal (e.g., Login, Address, Review)
        │         See all APIs for that modal
        │
        └─ NO
            ↓
        Do you need quick lookup of an endpoint?
            ├─ YES → Go to API_QUICK_REFERENCE.md
            │         Use tables for fast lookup
            │         See integration phases
            │
            └─ NO
                ↓
            Need detailed endpoint specifications?
                └─ YES → Go to API_DOCUMENTATION.md
                          Full request/response examples
                          Complete authentication flows
```

---

## 🔍 Search By Need

### "I want to implement..."

| Feature | Primary Doc | Secondary Doc |
|---------|-------------|---------------|
| **User Login** | [Modals - Login Modal](./API_MODALS_DIALOGS_MAPPING.md#-login-modal) | [API Docs - Auth](./API_DOCUMENTATION.md#authentication--token-management) |
| **Product Listing** | [Pages - PLP](./API_PAGES_MAPPING.md#4-product-listing-page-plp--category) | [Quick Ref - Products](./API_QUICK_REFERENCE.md#-products-4-apis) |
| **Add to Cart** | [Pages - PDP](./API_PAGES_MAPPING.md#5-product-detail-page-pdp) | [API Docs - Cart](./API_DOCUMENTATION.md#cart-management) |
| **Checkout Flow** | [Pages - Checkout](./API_PAGES_MAPPING.md#7-checkout-page) | [Modals - Address](./API_MODALS_DIALOGS_MAPPING.md#-addedit-address-modal) |
| **Order History** | [Pages - Orders](./API_PAGES_MAPPING.md#8-orders-page-order-history) | [API Docs - Orders](./API_DOCUMENTATION.md#order-management) |
| **Product Reviews** | [Modals - Review](./API_MODALS_DIALOGS_MAPPING.md#-review-card-modal) | [API Docs - Reviews](./API_DOCUMENTATION.md#reviews--ratings) |
| **Wishlist** | [Pages - Wishlist](./API_PAGES_MAPPING.md#10-wishlist-page) | [API Docs - Wishlist](./API_DOCUMENTATION.md#wishlist) |
| **User Profile** | [Modals - Profile](./API_MODALS_DIALOGS_MAPPING.md#-update-profile-modal) | [Pages - Profile](./API_PAGES_MAPPING.md#11-profileedit-profile-page) |
| **Payment** | [Modals - Payment](./API_MODALS_DIALOGS_MAPPING.md#-payment-client-modal) | [API Docs - Payment](./API_DOCUMENTATION.md#payment-apis) |

---

## 📚 Document Contents At-a-Glance

### 📖 API_DOCUMENTATION.md (Complete Reference)
**2,706 lines | 67+ endpoints**

**Use When**: You need complete specifications

**Contains**:
- ✅ All endpoint details (method, URL, headers, params)
- ✅ Complete request/response examples
- ✅ Authentication flows (Guest, User, OAuth)
- ✅ Error handling & status codes
- ✅ Security best practices
- ✅ Token management patterns
- ✅ Caching strategies
- ✅ Testing checklist

**Key Sections**:
- Authentication (9 endpoints)
- Store & Menu (4 endpoints)
- Products (4 endpoints)
- Cart (6 endpoints)
- Checkout (7 endpoints)
- Orders (5 endpoints)
- Payment (2 endpoints)
- Reviews (9 endpoints)
- Wishlist (3 endpoints)
- Profile (3 endpoints)
- And more...

---

### ⚡ API_QUICK_REFERENCE.md (Cheat Sheet)
**384 lines | Fast lookup**

**Use When**: You need quick answers

**Contains**:
- ✅ Endpoint tables by category
- ✅ Header requirements matrix
- ✅ Response codes guide
- ✅ Integration priority phases
- ✅ Common flows (auth, order, search)
- ✅ Caching strategy table
- ✅ Mobile code examples

**Key Tables**:
- Authentication APIs (9)
- Store & Menu (4)
- Products (4)
- Cart Management (6)
- Checkout & Address (7)
- Order Management (5)
- Payment (2)
- Reviews & Ratings (9)

---

### 📄 API_PAGES_MAPPING.md (Screen Guide)
**1,343 lines | 17 pages documented**

**Use When**: Building specific screens

**Contains**:
- ✅ APIs grouped by page/screen
- ✅ When each API is called
- ✅ Complete user flows
- ✅ Page-specific examples
- ✅ API call sequences
- ✅ Integration priorities

**Pages Covered**:
1. General/Global (9 APIs)
2. Homepage (5 APIs)
3. Store/Menu Page (3 APIs)
4. Product Listing (5 APIs)
5. Product Detail (8 APIs)
6. Cart Page (6 APIs)
7. Checkout (8 APIs)
8. Orders List (2 APIs)
9. Order Details (7 APIs)
10. Wishlist (3 APIs)
11. Profile (4 APIs)
12. Events (2 APIs)
13. About Us (2 APIs)
14. Payment (2 APIs)
15. Review Modals (6 APIs)
16. Search (4 APIs)
17. Header/Nav (3 APIs)

---

### 🔔 API_MODALS_DIALOGS_MAPPING.md (Modal Guide)
**1,111 lines | 25+ modals documented**

**Use When**: Implementing modals/dialogs

**Contains**:
- ✅ APIs called within each modal
- ✅ Modal trigger points
- ✅ Where modals open from
- ✅ Nested modal hierarchies
- ✅ Modal flow diagrams
- ✅ Success/error handling

**Modals Covered**:
1. Authentication (4 modals)
   - Login, OTP, Signup, Logout
2. Cart & Products (6 modals)
   - Customizations, Instructions, Cancel
3. Checkout & Address (4 modals)
   - Add/Edit Address, Coupons
4. Orders (2 modals)
   - Freebies, Order Success
5. Profile (5 modals)
   - Update Profile, Email, Drawer
6. Reviews (1 modal)
   - Complete review flow (6 APIs)
7. Informational (3 modals)
   - Menu, Features, Delete
8. Payment (1 modal)
   - Stripe integration

---

## 🎓 Learning Paths

### For New Developers (Week 1)

**Day 1-2**: Foundation
1. Read [API Docs Home](./README.md)
2. Review [Quick Reference](./API_QUICK_REFERENCE.md)
3. Understand authentication flow

**Day 3-4**: Implementation Basics
1. Study [Pages Mapping - General APIs](./API_PAGES_MAPPING.md#1-general--global-apis)
2. Implement guest authentication
3. Implement token refresh

**Day 5**: First Feature
1. Pick one screen from [Pages Mapping](./API_PAGES_MAPPING.md)
2. Implement all APIs for that screen
3. Test the complete flow

---

### For Experienced Developers (Fast Track)

**Hour 1**: Overview
- Skim [Quick Reference](./API_QUICK_REFERENCE.md)
- Note integration phases
- Review header requirements

**Hour 2**: Authentication
- Read [API Docs - Auth Section](./API_DOCUMENTATION.md#authentication--token-management)
- Implement token management
- Set up interceptors

**Hour 3+**: Feature Implementation
- Use [Pages Mapping](./API_PAGES_MAPPING.md) for screens
- Use [Modals Mapping](./API_MODALS_DIALOGS_MAPPING.md) for dialogs
- Reference [API Docs](./API_DOCUMENTATION.md) for details

---

## 🔗 Cross-Reference Guide

### Common Scenarios

**Scenario**: User adds product to cart

**Documentation Path**:
1. [Pages - PDP](./API_PAGES_MAPPING.md#5-product-detail-page-pdp) → Find "Add to Cart" section
2. [API Docs - Cart](./API_DOCUMENTATION.md#cart-management) → Get endpoint details
3. [Quick Ref - Headers](./API_QUICK_REFERENCE.md#-header-requirements-by-endpoint-type) → Check required headers

---

**Scenario**: User updates delivery address

**Documentation Path**:
1. [Modals - Add Address](./API_MODALS_DIALOGS_MAPPING.md#-addedit-address-modal) → See modal flow
2. [Pages - Checkout](./API_PAGES_MAPPING.md#7-checkout-page) → See page context
3. [API Docs - Address](./API_DOCUMENTATION.md#checkout--address) → Get endpoint specs

---

**Scenario**: User writes product review

**Documentation Path**:
1. [Modals - Review Card](./API_MODALS_DIALOGS_MAPPING.md#-review-card-modal) → See complete flow (6 APIs)
2. [Pages - Order Details](./API_PAGES_MAPPING.md#9-order-details-page) → See when review opens
3. [API Docs - Reviews](./API_DOCUMENTATION.md#reviews--ratings) → Get all review endpoints

---

## 📊 Statistics

### Documentation Coverage

| Metric | Count |
|--------|-------|
| **Total Endpoints** | 67+ |
| **Pages Documented** | 17 |
| **Modals Documented** | 25+ |
| **Complete Examples** | 100+ |
| **Total Lines** | ~6,000 |
| **API Categories** | 16 |
| **External Services** | 4 |
| **Auth Methods** | 3 |

### File Sizes

| Document | Lines | Focus |
|----------|-------|-------|
| API_DOCUMENTATION.md | 2,706 | Complete specs |
| API_PAGES_MAPPING.md | 1,343 | Screen APIs |
| API_MODALS_DIALOGS_MAPPING.md | 1,111 | Modal APIs |
| API_QUICK_REFERENCE.md | 384 | Quick lookup |
| README.md | 440 | Navigation hub |
| **Total** | **5,984** | **Everything** |

---

## 🎯 Quick Access Links

### Most Used Sections

- [Authentication Flow](./API_DOCUMENTATION.md#authentication--token-management)
- [Token Refresh Pattern](./API_QUICK_REFERENCE.md#token-refresh-flow)
- [Header Requirements](./API_QUICK_REFERENCE.md#-header-requirements-by-endpoint-type)
- [Integration Phases](./API_QUICK_REFERENCE.md#-integration-priority-for-mobile)
- [Complete Order Flow](./API_PAGES_MAPPING.md#complete-order-flow)
- [Error Handling](./API_DOCUMENTATION.md#error-handling)
- [Caching Strategy](./API_QUICK_REFERENCE.md#-caching-strategy)

### Common Endpoints

- [Guest Auth](./API_DOCUMENTATION.md#1-guest-authentication)
- [Get Products](./API_DOCUMENTATION.md#14-get-product-details)
- [Add to Cart](./API_DOCUMENTATION.md#19-add-to-cart)
- [Get Cart](./API_DOCUMENTATION.md#18-get-cart)
- [Checkout](./API_DOCUMENTATION.md#30-checkout--place-order)
- [Get Orders](./API_DOCUMENTATION.md#31-get-all-orders)

---

## 🔄 Update Guide

When APIs change, update in this order:

1. **API_DOCUMENTATION.md** - Update endpoint details
2. **API_QUICK_REFERENCE.md** - Update tables
3. **API_PAGES_MAPPING.md** - Update if screen flow changes
4. **API_MODALS_DIALOGS_MAPPING.md** - Update if modal APIs change
5. **README.md** - Update if structure changes

---

## 💡 Pro Tips

1. **Use Browser Search** (Ctrl/Cmd + F) to find endpoints across all docs
2. **Start with README.md** - It has the best overview and links
3. **Bookmark Quick Reference** - For daily development
4. **Print/Save Page Mapping** - For screen implementation planning
5. **Cross-reference** - Use multiple docs for complete understanding

---

## 📞 Need Help?

**Can't find what you need?**

1. Check [README.md](./README.md) - Comprehensive navigation
2. Use flowchart above - Find the right document
3. Use search tables - Quick lookup by feature
4. Review examples - All docs have complete examples

**Still stuck?**

- Check error messages - APIs return helpful errors
- Review testing checklist - Common issues listed
- Test with Postman - Verify endpoint behavior

---

**Last Updated**: December 2024  
**Maintained By**: PlateAway Development Team

