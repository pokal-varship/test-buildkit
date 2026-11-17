import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Generate build timestamp for versioning static assets
const buildTimestamp = Date.now().toString();

const nextConfig: NextConfig = {
  // Add versioning to static assets using timestamp as query parameter
  generateBuildId: async () => {
    return buildTimestamp;
  },

  // Enable static generation for better performance
  trailingSlash: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "photos.plateaway.com",
      },
      {
        protocol: "https",
        hostname: "photos.qykly.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    console.log("isDev", isDev);
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/umamiScript.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=7776000, immutable", // 90 days in seconds
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=15778476, immutable", // 6 months in seconds
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isDev
              ? "no-store, must-revalidate" // dev: always fresh so file changes show immediately
              : "public, max-age=31536000, immutable", // prod: 1 year for static assets
          },
        ],
      },
      // Sitemap XML files headers (for numbered sitemaps)
      {
        source: "/sitemap-:number.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600", // 1 hour cache
          },
          {
            key: "X-Robots-Tag",
            value: "noindex", // Prevent indexing of sitemap files themselves
          },
        ],
      },
      // Sitemap index headers
      {
        source: "/sitemap-index.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600", // 1 hour cache
          },
          {
            key: "X-Robots-Tag",
            value: "noindex", // Prevent indexing of sitemap files themselves
          },
        ],
      },
      // Main sitemap.xml headers
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600", // 1 hour cache
          },
          {
            key: "X-Robots-Tag",
            value: "noindex", // Prevent indexing of sitemap files themselves
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/locations",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // Construct sitemap URLs from environment variables
    const sitemapBaseUrl = process.env.NEXT_PUBLIC_SITEMAP_BASE_URL;
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

    if (!sitemapBaseUrl || !tenantId) {
      return [];
    }

    const sitemapIndexPath = `sitemap-${tenantId}-index`;
    const sitemapIndexUrl = `${sitemapBaseUrl}/${sitemapIndexPath}/${sitemapIndexPath}.xml`;

    return [
      // Main sitemap.xml proxy
      {
        source: "/sitemap.xml",
        destination: sitemapIndexUrl,
      },
      // Support for numbered sitemap files (sitemap-1.xml, sitemap-2.xml, etc.)
      {
        source: "/sitemap-:number.xml",
        destination: `${sitemapBaseUrl}/sitemap-${tenantId}-:number/sitemap-${tenantId}-:number.xml`,
      },
      // Support for sitemap index files
      {
        source: "/sitemap-index.xml",
        destination: sitemapIndexUrl,
      },
    ];
  },
  webpack(
    config: import("webpack").Configuration,
    { dev, isServer }: { dev: boolean; isServer: boolean },
  ) {
    // SVG loader configuration for webpack (fallback when Turbopack is not used)
    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Add timestamp to chunk filenames in production for cache busting
    // Only modify client-side chunks, not server-side chunks
    if (!dev && !isServer && config.output) {
      // Preserve Next.js default patterns but add timestamp for cache busting
      const originalFilename = config.output.filename as string;
      const originalChunkFilename = config.output.chunkFilename as string;

      // Only modify if we can safely add timestamp without breaking Next.js structure
      if (
        typeof originalFilename === "string" &&
        originalFilename.includes("[contenthash]")
      ) {
        config.output.filename = originalFilename.replace(
          "[contenthash]",
          `[contenthash].${buildTimestamp}`,
        );
      }
      if (
        typeof originalChunkFilename === "string" &&
        originalChunkFilename.includes("[contenthash]")
      ) {
        config.output.chunkFilename = originalChunkFilename.replace(
          "[contenthash]",
          `[contenthash].${buildTimestamp}`,
        );
      }
    }

    // Strip console statements in production for better performance
    if (!dev && config.optimization?.minimizer) {
      (config.optimization.minimizer as unknown[]).forEach(
        (minimizer: unknown) => {
          if (
            typeof minimizer === "object" &&
            minimizer !== null &&
            "constructor" in minimizer &&
            minimizer.constructor?.name === "TerserPlugin" &&
            "options" in minimizer &&
            typeof minimizer.options === "object" &&
            minimizer.options !== null &&
            "terserOptions" in minimizer.options &&
            typeof minimizer.options.terserOptions === "object" &&
            minimizer.options.terserOptions !== null &&
            "compress" in minimizer.options.terserOptions
          ) {
            const compress = minimizer.options.terserOptions.compress as Record<
              string,
              unknown
            >;
            compress.drop_console = true;
            compress.drop_debugger = true;
          }
        },
      );
    }

    return config;
  },
  // Turbopack configuration
  turbopack: {
    // Configure module resolution aliases
    resolveAlias: {
      // Add any custom aliases you need here
    },
    // Configure rules for file types
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  experimental: {
    cssChunking: true,
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  reactCompiler: true,
  // Enable production source maps for better debugging (optional, can be disabled for security)
  productionBrowserSourceMaps: false,
  // Disable React strict mode
  reactStrictMode: false,
  // Enable powered by header removal for security
  poweredByHeader: false,
  // Enable compression for better performance
  compress: true,
  // Configure server external packages
  serverExternalPackages: ["@node-rs/argon2"],
  // Bundle Pages Router dependencies for better performance
  bundlePagesRouterDependencies: true,
  // Configure transpile packages for external libraries
  transpilePackages: [
    "@mui/material",
    "@mui/icons-material",
    "@mui/x-date-pickers",
  ],
  // Configure output file tracing for deployment optimization
  outputFileTracingIncludes: {
    "/": ["./cache/**/*"],
  },
  logging: {
    browserToTerminal: true,
  },
};

export default bundleAnalyzer(nextConfig);
