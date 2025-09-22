import { prisma } from "@/lib/prisma";
import type { Prisma, ProductCategory } from "@prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    gallery: true;
    specifications: true;
    components: {
      include: {
        component: true;
      };
    };
    reviews: true;
  };
}>;

export type ProductFilters = {
  category?: ProductCategory;
  search?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest";

export async function getFeaturedProducts(limit = 3): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE" },
    include: {
      gallery: { orderBy: { position: "asc" } },
      specifications: { orderBy: { position: "asc" } },
      components: {
        include: { component: true },
        orderBy: { position: "asc" },
      },
      reviews: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllProducts(
  filters: ProductFilters = {},
  sort: ProductSort = "featured",
): Promise<ProductWithRelations[]> {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search } },
      { headline: { contains: search } },
      { shortDescription: { contains: search } },
    ];
  }

  if (filters.minPriceCents || filters.maxPriceCents) {
    where.basePriceCents = {};
    if (filters.minPriceCents) {
      where.basePriceCents.gte = filters.minPriceCents;
    }
    if (filters.maxPriceCents) {
      where.basePriceCents.lte = filters.maxPriceCents;
    }
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case "price-asc":
        return { basePriceCents: "asc" };
      case "price-desc":
        return { basePriceCents: "desc" };
      case "newest":
        return { createdAt: "desc" };
      case "featured":
      default:
        return { isFeatured: "desc" };
    }
  })();

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      gallery: { orderBy: { position: "asc" } },
      specifications: { orderBy: { position: "asc" } },
      components: {
        include: { component: true },
        orderBy: { position: "asc" },
      },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      gallery: { orderBy: { position: "asc" } },
      specifications: { orderBy: { position: "asc" } },
      components: {
        include: { component: true },
        orderBy: { position: "asc" },
      },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getRelatedProducts(productId: string, limit = 3) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      gallery: { orderBy: { position: "asc" } },
      specifications: { orderBy: { position: "asc" } },
      components: {
        include: { component: true },
        orderBy: { position: "asc" },
      },
      reviews: true,
    },
  });
}

export async function getCategoriesWithCounts() {
  const categories = await prisma.product.groupBy({
    by: ["category"],
    _count: { category: true },
  });

  return categories.map((category) => ({
    category: category.category,
    count: category._count.category,
  }));
}

