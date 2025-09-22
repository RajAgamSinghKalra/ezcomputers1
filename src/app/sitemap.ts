import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(SITE_URL);

  const staticPaths = [
    "",
    "/prebuilt",
    "/custom-builder",
    "/about",
    "/contact",
    "/support",
    "/account",
    "/cart",
    "/checkout",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

  const productPaths = products.map((product) => ({
    url: `${baseUrl}/prebuilt/${product.slug}`,
    lastModified: product.updatedAt,
  }));

  return [...staticPaths, ...productPaths];
}

