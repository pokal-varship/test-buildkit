# Breadcrumb Schema Implementation

## Overview

This document describes the implementation of dynamic breadcrumb schema markup across the PlateAway website. The breadcrumb schema follows the [schema.org BreadcrumbList](https://schema.org/BreadcrumbList) specification to improve SEO and help search engines understand the site's navigation hierarchy.

## Features

- ✅ **Dynamic breadcrumb generation** based on URL structure
- ✅ **Automatic integration** with existing schema components
- ✅ **PDP (Product Detail Page)** breadcrumbs
- ✅ **PLP (Product Listing Page)** breadcrumbs
- ✅ **Supports multiple URL patterns**
- ✅ **Type-safe implementation** with TypeScript
- ✅ **Non-intrusive** - doesn't disturb existing schema markup

## Architecture

### Core Components

#### 1. BreadcrumbSchema Component
**Location:** `/components/schema/BreadcrumbSchema.tsx`

A reusable React component that renders breadcrumb structured data in JSON-LD format.

```typescript
interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  id?: string;
}
```

**Example Output:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Break Fast",
      "item": "https://example.com?menu=break-fast"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Biscuits",
      "item": "https://example.com?menu=break-fast&category=biscuits"
    }
  ]
}
```

#### 2. Breadcrumb Helper Utilities
**Location:** `/lib/breadcrumbHelper.ts`

Utility functions to generate breadcrumb items from URL parameters.

**Main Functions:**

- `generateBreadcrumbs(params)`: Generates breadcrumb items based on page context
- `slugToName(slug)`: Converts URL slugs to human-readable names

**Parameters:**
```typescript
interface GenerateBreadcrumbsParams {
  baseUrl: string;
  menuSlug?: string;
  menuName?: string;
  categorySlug?: string;
  categoryName?: string;
  storeSlug?: string;
  storeName?: string;
  productSlug?: string;
  productName?: string;
}
```

## Implementation by Page Type

### 1. Product Detail Page (PDP)

**File:** `/components/schema/ProductDetailsSchema.tsx`

Breadcrumbs automatically generated with:
- Home
- Store (if available)
- Menu (if available)
- Category (if available)
- Product

**Example URL Pattern:**
```
/{storeSlug}/{menuSlug}/{categorySlug}/{productSlug}
```

**Schema Usage:**
```tsx
<ProductDetailsSchema 
  menuId={menuId}
  categoryId={categoryId}
  storeId={storeId}
  product={productData}
  productSlug={productSlug}
  categoryName="Biscuits"
  menuName="Break Fast"
  storeName="Subway Rajajinagar"
/>
```

### 2. Product Listing Page (PLP)

**File:** `/components/schema/ProductListingSchema.tsx`

Breadcrumbs automatically generated with:
- Home
- Store (if available)
- Menu (if available)
- Category

**Example URL Pattern:**
```
/{storeSlug}/{menuSlug}/{categorySlug}
```

**Schema Usage:**
```tsx
<ProductListingSchema 
  products={products}
  categoryName="Biscuits"
  categoryDescription="Delicious biscuits"
  categoryId={categoryId}
  storeSlug={storeSlug}
  storeName="Subway Rajajinagar"
  menuName="Break Fast"
  totalFound={totalProducts}
/>
```

### 3. General Pages (via PageSchema)

**File:** `/schema/PageSchema.tsx`

Pages can optionally include breadcrumbs by passing a `breadcrumbs` prop:

```tsx
<PageSchema 
  schemaType="organization"
  pageType="home"
  data={schemaData}
  breadcrumbs={[
    { position: 1, name: "Home", item: "https://example.com" },
    { position: 2, name: "About Us", item: "https://example.com/about-us" }
  ]}
/>
```

## URL Pattern Support

The breadcrumb system supports multiple URL patterns:

### Pattern 1: Full Structured Path
```
https://example.com/{storeSlug}/{menuSlug}/{categorySlug}/{productSlug}
```
Example: `https://example.com/subway-rajajinagar/break-fast/biscuits/subway-chocolate-cookies`

### Pattern 2: Query Parameters
```
https://example.com/products/{productSlug}?menu={menuSlug}&category={categorySlug}&store={storeSlug}
```
Example: `https://example.com/products/subway-chocolate-cookies?menu=break-fast&category=biscuits&store=subway-rajajinagar`

### Pattern 3: Mixed (Category Listing)
```
https://example.com/{storeSlug}/{menuSlug}/{categorySlug}
```
Example: `https://example.com/subway-rajajinagar/break-fast/biscuits`

## Schema Integration

### How Breadcrumbs are Added

The breadcrumb schema is rendered **alongside** existing product/listing schema without replacing or modifying it:

```tsx
// Before (only product schema)
return (
  <script type="application/ld+json">
    {JSON.stringify(productSchema)}
  </script>
);

// After (product schema + breadcrumb schema)
return (
  <>
    <script type="application/ld+json">
      {JSON.stringify(productSchema)}
    </script>
    <BreadcrumbSchema items={breadcrumbs} id="breadcrumb-pdp-123" />
  </>
);
```

### Multiple Schema Blocks

Each page can have multiple schema blocks:
- **ProductSchema** or **ItemListSchema**: Main content schema
- **BreadcrumbSchema**: Navigation schema
- **OrganizationSchema**: Business information (on relevant pages)

All schema blocks coexist and are properly indexed by search engines.

## Testing & Validation

### Testing Breadcrumb Schema

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Paste your page URL or HTML
   - Check for "BreadcrumbList" in results

2. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Validate JSON-LD output

3. **Manual Inspection**
   ```javascript
   // In browser console
   const scripts = document.querySelectorAll('script[type="application/ld+json"]');
   scripts.forEach(script => console.log(JSON.parse(script.innerHTML)));
   ```

### Expected Output

For a PDP page, you should see TWO schema blocks:

```html
<!-- Product Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Subway Chocolate Cookies",
  ...
}
</script>

<!-- Breadcrumb Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
</script>
```

## Customization

### Adding Custom Breadcrumbs

To add breadcrumbs to a custom page:

```tsx
import BreadcrumbSchema from '@components/schema/BreadcrumbSchema';
import { generateBreadcrumbs } from '@lib/breadcrumbHelper';

function CustomPage() {
  const breadcrumbs = generateBreadcrumbs({
    baseUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || '',
    // Add your custom breadcrumb hierarchy
  });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} id="breadcrumb-custom" />
      {/* Your page content */}
    </>
  );
}
```

### Modifying Breadcrumb Generation

Edit `/lib/breadcrumbHelper.ts` to customize how breadcrumbs are generated:

```typescript
export function generateBreadcrumbs(params: GenerateBreadcrumbsParams): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let position = 1;

  // Always start with Home
  breadcrumbs.push({
    position: position++,
    name: "Home",
    item: params.baseUrl
  });

  // Add your custom logic here
  // ...

  return breadcrumbs;
}
```

## Performance Considerations

- **Client-side rendering**: Breadcrumb schemas are generated on the client to access `window.location.origin`
- **Memoization**: ProductListingSchema uses React.memo to prevent unnecessary re-renders
- **Minimal overhead**: Schema generation is lightweight and doesn't impact page load times
- **No external dependencies**: Pure JavaScript/TypeScript implementation

## Browser Compatibility

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Server-side rendering (SSR) compatible
- ✅ Client-side rendering (CSR) compatible
- ✅ Static site generation (SSG) compatible

## SEO Benefits

1. **Improved Search Results**: Rich breadcrumb trails in Google search results
2. **Better Crawling**: Search engines understand site hierarchy
3. **Enhanced Navigation**: Users see the path in search results
4. **Reduced Bounce Rate**: Clear navigation path encourages exploration
5. **Mobile-Friendly**: Breadcrumbs display well on mobile search results

## Maintenance

### Type Safety

All components are fully typed with TypeScript:
- `BreadcrumbItem` interface ensures correct data structure
- Props are validated at compile time
- IDE autocomplete support

### Future Enhancements

Potential improvements:
- [ ] Add support for additional languages
- [ ] Implement breadcrumb caching
- [ ] Add breadcrumb tracking/analytics
- [ ] Support for custom breadcrumb formatting
- [ ] Breadcrumb microdata format (in addition to JSON-LD)

## Troubleshooting

### Breadcrumbs not showing in schema

1. Check if the page is rendering the schema component
2. Verify breadcrumb data is being passed correctly
3. Inspect browser console for errors
4. Use Google Rich Results Test to validate

### Incorrect breadcrumb URLs

1. Verify `NEXT_PUBLIC_WEBSITE_URL` environment variable
2. Check slug formatting in URL parameters
3. Ensure category/menu/store names are available

### Duplicate breadcrumb schemas

1. Each schema should have a unique `id` prop
2. Check for multiple calls to `<BreadcrumbSchema />`
3. Verify React.memo is working correctly

## References

- [Schema.org BreadcrumbList](https://schema.org/BreadcrumbList)
- [Google Search - Breadcrumb Structured Data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)

## Support

For issues or questions about breadcrumb schema implementation, please contact the development team or create an issue in the project repository.

