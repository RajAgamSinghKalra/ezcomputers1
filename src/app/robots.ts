import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const DISALLOWED_PATHS = ["/api/", "/auth/", "/account/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

