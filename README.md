# PlateAway Web Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📚 Documentation

### API Documentation (For Mobile & Backend Teams)
Comprehensive API documentation for integrating with PlateAway's e-commerce platform:

- **[API Documentation Hub](./docs/api/README.md)** - Start here for complete API reference
  - [Complete API Reference](./docs/api/API_DOCUMENTATION.md) - 67+ endpoints with detailed specs
  - [Quick Reference Guide](./docs/api/API_QUICK_REFERENCE.md) - Cheat sheet for fast lookup
  - [Page-by-Page Mapping](./docs/api/API_PAGES_MAPPING.md) - APIs organized by screens
  - [Modal/Dialog Reference](./docs/api/API_MODALS_DIALOGS_MAPPING.md) - APIs in modals & dialogs

### Technical Documentation
- [Breadcrumb Schema](./docs/BREADCRUMB_SCHEMA.md) - SEO breadcrumb implementation
- [Static Generation](./docs/STATIC_GENERATION.md) - Build-time page generation
- [Logging Guide](./docs/LOGGING.md) - Application logging setup
- [Page Management API](./docs/PAGE_MANAGEMENT_API.md) - CMS page management
- [Sitemap Setup](./docs/SITEMAP_SETUP.md) - SEO sitemap configuration
- [Husky Setup](./docs/HUSKY.md) - Git hooks configuration

## Navigation & URL Generation

This project uses a centralized URL generation system via the `useProductUrl` hook for consistent and optimized navigation.

### Hook Location
`hooks/useProductUrl.ts`

### Available Functions

#### Product URLs
- **`getProductUrl(product, storeSlug?)`** - PLP to PDP navigation
  - Format: `/products/{slug}?store=&category=&menu=`
- **`getSearchProductUrl(product, storeSlug?)`** - Search results to PDP
  - Format: `/products/{slug}?store=&menu=&category=`
- **`getOrderProductUrl(productSlug, categorySlug, menuSlug?, storeSlug?, extraParams?)`** - Order details to PDP
  - Format: `/products/{slug}?store=&category=&menu=`
- **`getCartItemProductUrl(productSlug, categorySlug, menuSlug?, storeSlug?, extraParams?)`** - Cart/reorder to PDP
  - Format: `/products/{slug}?store=&menu=&category=`

#### Page URLs
- **`getCategoryUrl(categorySlug, menuSlug?, storeSlug?, extraParams?)`** - Category/PLP pages
  - Format: `/{store}/{menu}/{category}`
- **`getMenuUrl(menuSlug?, storeSlug?)`** - Menu pages
  - Format: `/{store}/{menu}`
- **`getStoreUrl(storeSlug?)`** - Store pages
  - Format: `/{store}`
- **`getCartUrl(storeSlug?)`** - Cart page
  - Format: `/{store}/cart`
- **`getWishlistUrl(storeSlug?, menuSlug?)`** - Wishlist page
  - Format: `/{store}/{menu}/wishlist`
- **`getCheckoutUrl(storeSlug?)`** - Checkout page
  - Format: `/{store}/checkout`
- **`getComboStepUrl(categorySlug, stepName, menuSlug?, storeSlug?)`** - Combo flow navigation
  - Format: `/{store}/{menu}/{category}?type=combo&step={stepName}`

### Usage

```typescript
import useProductUrl from '@hooks/useProductUrl';

function MyComponent() {
  const { getProductUrl, getCategoryUrl, getCartUrl } = useProductUrl();
  
  // For navigation with Link component (preferred)
  return (
    <Link href={getProductUrl(product)} prefetch={true}>
      {product.name}
    </Link>
  );
  
  // For programmatic navigation
  const handleClick = () => {
    router.push(getCartUrl());
  };
}
```

### Best Practices
1. **Always use `<Link prefetch={true}>`** for navigation when possible
2. **Never manually construct URLs** like `/products/${slug}` or `/${store}/${menu}`
3. **Use the appropriate function** for your navigation context (PLP vs search vs cart)
4. **Pass extra params** via the `extraParams` argument for dynamic query parameters

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
