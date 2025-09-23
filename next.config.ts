import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://images.unsplash.com data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const existingIgnored = config.watchOptions?.ignored;

      if (existingIgnored instanceof RegExp) {
        const additionalPattern = "System Volume Information|DumpStack\\.log\\.tmp";
        const flags = existingIgnored.flags.includes("i")
          ? existingIgnored.flags
          : `${existingIgnored.flags}i`;

        config.watchOptions = {
          ...config.watchOptions,
          ignored: new RegExp(`${existingIgnored.source}|${additionalPattern}`, flags),
        };
      } else {
        const ignoredEntries = [
          ...(Array.isArray(existingIgnored)
            ? existingIgnored
            : existingIgnored
              ? [existingIgnored]
              : []),
        ];

        const windowsSystemPatterns = ["**/System Volume Information/**", "**/DumpStack.log.tmp"];

        windowsSystemPatterns.forEach((pattern) => {
          if (!ignoredEntries.includes(pattern)) {
            ignoredEntries.push(pattern);
          }
        });

        config.watchOptions = {
          ...config.watchOptions,
          ignored: ignoredEntries,
        };
      }
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*\\.(?:js|css|png|jpg|jpeg|gif|webp|avif|ico|ttf|otf|woff|woff2)",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, s-maxage=600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
