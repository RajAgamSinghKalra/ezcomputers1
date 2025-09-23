"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ProductCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HoverPrefetchLink } from "@/components/navigation/prefetch-link";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

type ActiveFilters = {
  category?: ProductCategory;
  search?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: string;
};

type PrebuiltFiltersProps = {
  categories: Array<{ category: ProductCategory; count: number }>;
  initial: ActiveFilters;
};

export function PrebuiltFilters({ categories, initial }: PrebuiltFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSortParam = searchParams.get("sort");
  const activeSort = sortOptions.some((option) => option.value === activeSortParam)
    ? (activeSortParam as string)
    : initial.sort ?? "featured";

  const activeCategoryParam = searchParams.get("category");
  const activeCategory = (activeCategoryParam ?? initial.category ?? undefined) as ProductCategory | undefined;
  const normalizedActiveCategory = activeCategory ?? null;

  const searchParamsString = searchParams.toString();

  const buildQuery = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParamsString);
      Object.entries(overrides).forEach(([key, value]) => {
        if (!value || value.length === 0) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const queryString = params.toString();
      return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
    },
    [pathname, searchParamsString],
  );

  return (
    <aside className="flex flex-col gap-8 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Search</span>
        <form method="GET" action={pathname} className="flex gap-2">
          <input
            name="q"
            defaultValue={initial.search ?? ""}
            placeholder="Search builds"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          />
          {normalizedActiveCategory ? <input type="hidden" name="category" value={normalizedActiveCategory} /> : null}
          {activeSort ? <input type="hidden" name="sort" value={activeSort} /> : null}
          {typeof initial.minPriceCents === "number" ? (
            <input type="hidden" name="min" value={initial.minPriceCents} />
          ) : null}
          {typeof initial.maxPriceCents === "number" ? (
            <input type="hidden" name="max" value={initial.maxPriceCents} />
          ) : null}
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Categories</span>
        <div className="grid gap-2">
          <HoverPrefetchLink
            href={buildQuery({ category: undefined })}
            className={cn(
              "flex items-center justify-between rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
              normalizedActiveCategory === null && "border-brand-500/40 bg-brand-500/10 text-brand-600",
            )}
          >
            <span>All systems</span>
          </HoverPrefetchLink>
          {categories.map((category) => (
            <HoverPrefetchLink
              key={category.category}
              href={buildQuery({ category: category.category })}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
                normalizedActiveCategory === category.category && "border-brand-500/40 bg-brand-500/10 text-brand-600",
              )}
            >
              <span>{CATEGORY_LABELS[category.category]}</span>
              <span className="text-xs text-foreground-muted">{category.count}</span>
            </HoverPrefetchLink>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Sort</span>
        <div className="grid gap-2">
          {sortOptions.map((option) => (
            <HoverPrefetchLink
              key={option.value}
              href={buildQuery({ sort: option.value })}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border border-border-soft px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
                activeSort === option.value && "border-brand-500/40 bg-brand-500/10 text-brand-600",
              )}
            >
              <span>{option.label}</span>
            </HoverPrefetchLink>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Price range (USD)</span>
        <form method="GET" action={pathname} className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              name="min"
              type="number"
              min={0}
              step={50}
              defaultValue={initial.minPriceCents ? initial.minPriceCents / 100 : ""}
              placeholder="Min"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
            <input
              name="max"
              type="number"
              min={0}
              step={50}
              defaultValue={initial.maxPriceCents ? initial.maxPriceCents / 100 : ""}
              placeholder="Max"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            />
          </div>
          {normalizedActiveCategory ? <input type="hidden" name="category" value={normalizedActiveCategory} /> : null}
          {activeSort ? <input type="hidden" name="sort" value={activeSort} /> : null}
          {initial.search ? <input type="hidden" name="q" value={initial.search} /> : null}
          <Button type="submit" variant="secondary">
            Apply range
          </Button>
        </form>
      </div>

      <Button variant="ghost" href={pathname}>
        Reset filters
      </Button>
    </aside>
  );
}






