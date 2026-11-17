# Sitemap Proxy Configuration

This document explains how to set up the sitemap proxy functionality in the Next.js application.

## Overview

The application now includes a sitemap proxy that redirects requests from `/sitemap.xml` to an external S3 URL. This allows for dynamic sitemap serving without hosting the sitemap files locally.

## Environment Variables Required

You need to set the following environment variables in your `.env.local` file:

```bash
# Base URL for sitemap files on S3
NEXT_PUBLIC_SITEMAP_BASE_URL=https://newkommerce.s3.ap-south-1.amazonaws.com/plateaway/sitemap

# Tenant ID for sitemap path construction
NEXT_PUBLIC_TENANT_ID=67c69d52161c585e94ab9854
```

## How It Works

### URL Construction

The proxy constructs the final sitemap URL using this pattern:
```
{NEXT_PUBLIC_SITEMAP_BASE_URL}/sitemap-{NEXT_PUBLIC_TENANT_ID}-index/sitemap-{NEXT_PUBLIC_TENANT_ID}-index.xml
```

With the example values above, this becomes:
```
https://newkommerce.s3.ap-south-1.amazonaws.com/plateaway/sitemap/sitemap-67c69d52161c585e94ab9854-index/sitemap-67c69d52161c585e94ab9854-index.xml
```

### Supported Routes

The configuration supports the following sitemap routes:

1. **Main Sitemap**: `/sitemap.xml` → Proxies to the main sitemap index
2. **Numbered Sitemaps**: `/sitemap-1.xml`, `/sitemap-2.xml`, etc. → Proxies to numbered sitemap files
3. **Sitemap Index**: `/sitemap-index.xml` → Proxies to the main sitemap index

### Headers Configuration

The proxy automatically sets the following headers for sitemap files:

- `Content-Type: application/xml; charset=utf-8`
- `Cache-Control: public, max-age=3600, s-maxage=3600` (1 hour cache)
- `X-Robots-Tag: noindex` (prevents indexing of sitemap files themselves)

## Setup Instructions

1. **Create Environment File**: Create a `.env.local` file in the project root with the required environment variables.

2. **Restart Development Server**: After adding the environment variables, restart your development server:
   ```bash
   npm run dev
   ```

3. **Test the Proxy**: Visit `http://localhost:3000/sitemap.xml` to test if the proxy is working correctly.

## Production Deployment

For production deployments, ensure that the environment variables are set in your deployment platform:

- **Vercel**: Add the variables in the Vercel dashboard under Project Settings → Environment Variables
- **Other platforms**: Follow your platform's documentation for setting environment variables

## Troubleshooting

### "Sitemap environment variables not configured" Warning

If you see this warning in the console, it means the required environment variables are not set. Check that:

1. The `.env.local` file exists in the project root
2. The environment variables are correctly named and have values
3. You've restarted the development server after adding the variables

### 404 Errors on Sitemap Routes

If sitemap routes return 404 errors, verify that:

1. The S3 URL is accessible and returns valid XML content
2. The environment variables construct the correct URL path
3. The S3 bucket has proper CORS configuration if needed

## Configuration Details

The sitemap proxy is configured in `next.config.ts` using Next.js rewrites functionality. The configuration includes:

- Dynamic URL construction from environment variables
- Support for multiple sitemap file patterns
- Proper error handling when environment variables are missing
- SEO-optimized headers for XML content
