import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCategory } from "@prisma/client";
import { getAllProducts, getCategoriesWithCounts, type ProductSort } from "@/lib/data/products";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { ProductCard } from "@/components/cards/product-card";
import { PrebuiltFilters } from "@/components/prebuilt/prebuilt-filters";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pre-Built PCs",
  description:
    "Explore EZComputers pre-built PCs engineered for gaming, content creation, and professional workflows. Secure checkout, rigorous testing, and lifetime support included.",
};

type SearchParams = {
  category?: string;
  sort?: string;
  q?: string;
  min?: string;
  max?: string;
};

export default async function PrebuiltCatalogPage({ params, searchParams }: { params: Promise<Record<string, string>>; searchParams: Promise<SearchParams> }) {
  await params;
  const { category, sort = "featured", q, min, max } = await searchParams;

  const parsePriceParam = (value?: string) => {
    if (!value || value.length === 0) return undefined;
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) return undefined;
    if (numeric < 10000) {
      return Math.round(numeric * 100);
    }
    return Math.round(numeric);
  };

  const minPriceCents = parsePriceParam(min);
  const maxPriceCents = parsePriceParam(max);

  if ((min && minPriceCents === undefined) || (max && maxPriceCents === undefined)) {
    notFound();
  }

  const selectedCategory = category ? (Object.values(ProductCategory).includes(category as ProductCategory) ? (category as ProductCategory) : undefined) : undefined;

  const [products, categories] = await Promise.all([
    getAllProducts(
      {
        category: selectedCategory,
        search: q,
        minPriceCents,
        maxPriceCents,
      },
      sort as ProductSort,
    ),
    getCategoriesWithCounts(),
  ]);

  const filters = {
    category: selectedCategory,
    search: q,
    minPriceCents,
    maxPriceCents,
    sort,
  };

  return (
    <div className="container grid gap-10 py-16 lg:grid-cols-[320px_1fr]">
      <PrebuiltFilters categories={categories} initial={filters} />

      <div className="space-y-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Pre-built PC catalog</h1>
              <p className="text-sm text-foreground-muted">
                Every system is assembled in our Seattle lab, calibrated for thermals, and covered by lifetime technical support.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground-muted">
              <span>{products.length} build{products.length === 1 ? "" : "s"} ready to ship</span>
              {minPriceCents || maxPriceCents ? (
                <span>
                  Price range: {minPriceCents ? formatCurrencyFromCents(minPriceCents) : "Any"} - {maxPriceCents ? formatCurrencyFromCents(maxPriceCents) : "Any"}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-muted/60 p-12 text-center text-sm text-foreground-muted">
            <p>No systems match your filters yet. Try widening your price range or resetting filters.</p>
            <Button href="/prebuilt" className="mt-6">Reset filters</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

