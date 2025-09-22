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

const shouldIgnoreWindowsSystemPath = (watchPath: string) => {
  const normalized = watchPath.replace(/\\/g, "/").toLowerCase();
  return normalized.includes("system volume information") || normalized.includes("dumpstack.log.tmp");
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions ??= {};
    const existingIgnored = config.watchOptions.ignored;

    if (Array.isArray(existingIgnored)) {
      if (!existingIgnored.some((ignoreEntry) => ignoreEntry === shouldIgnoreWindowsSystemPath)) {
        config.watchOptions.ignored = [...existingIgnored, shouldIgnoreWindowsSystemPath];
      }
    } else if (existingIgnored) {
      config.watchOptions.ignored = [existingIgnored, shouldIgnoreWindowsSystemPath];
    } else {
      config.watchOptions.ignored = [shouldIgnoreWindowsSystemPath];
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
