"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
import type { ProductCategory } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingSort, setPendingSort] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<ProductCategory | null | undefined>(undefined);

  const activeSortParam = searchParams.get("sort");
  const activeSort = sortOptions.some((option) => option.value === activeSortParam)
    ? (activeSortParam as string)
    : initial.sort ?? "featured";
  const displayedSort = pendingSort ?? activeSort;

  const activeCategoryParam = searchParams.get("category");
  const activeCategory = (activeCategoryParam ?? initial.category ?? undefined) as ProductCategory | undefined;
  const normalizedActiveCategory = activeCategory ?? null;
  const displayedCategory = pendingCategory !== undefined ? pendingCategory : normalizedActiveCategory;

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

  useEffect(() => {
    setPendingSort(null);
  }, [activeSort]);

  useEffect(() => {
    setPendingCategory(undefined);
  }, [normalizedActiveCategory]);

  const handleSortChange = (value: string) => {
    setPendingSort(value);
    startTransition(() => {
      router.push(buildQuery({ sort: value }));
      router.refresh();
    });
  };

  const handleCategoryClick = (category?: ProductCategory) => {
    setPendingCategory(category ?? null);
    startTransition(() => {
      router.push(buildQuery({ category }));
      router.refresh();
    });
  };

  const handleRangeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsePrice = (value: string | null) => {
      if (!value) return undefined;
      const numeric = Number(value);
      if (Number.isNaN(numeric) || numeric <= 0) return undefined;
      return String(Math.round(numeric * 100));
    };

    const form = event.currentTarget;
    const formData = new FormData(form);
    const min = parsePrice(formData.get("minPrice")?.toString() ?? null);
    const max = parsePrice(formData.get("maxPrice")?.toString() ?? null);

    startTransition(() => {
      router.push(
        buildQuery({
          min,
          max,
        }),
      );
      router.refresh();
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const search = formData.get("q")?.toString() ?? undefined;

    startTransition(() => {
      router.push(buildQuery({ q: search }));
      router.refresh();
    });
  };

  const resetFilters = () => {
    setPendingCategory(null);
    setPendingSort("featured");
    startTransition(() => {
      router.push(pathname);
      router.refresh();
    });
  };

  return (
    <aside className="flex flex-col gap-8 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Search</span>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            name="q"
            defaultValue={initial.search ?? ""}
            placeholder="Search builds"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            Go
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Categories</span>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick(undefined)}
            className={cn(
              "flex items-center justify-between rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
              displayedCategory === null && "border-brand-500/40 bg-brand-500/10 text-brand-600",
            )}
            disabled={isPending}
          >
            <span>All systems</span>
          </button>
          {categories.map((category) => (
            <button
              key={category.category}
              type="button"
              onClick={() => handleCategoryClick(category.category)}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
                displayedCategory === category.category && "border-brand-500/40 bg-brand-500/10 text-brand-600",
              )}
              disabled={isPending}
            >
              <span>{CATEGORY_LABELS[category.category]}</span>
              <span className="text-xs text-foreground-muted">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Sort</span>
        <div className="grid gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSortChange(option.value)}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-md)] border border-border-soft px-4 py-2 text-sm transition hover:border-brand-400 hover:text-brand-500",
                displayedSort === option.value && "border-brand-500/40 bg-brand-500/10 text-brand-600",
              )}
              disabled={isPending}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Price range (USD)</span>
        <form onSubmit={handleRangeSubmit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              name="minPrice"
              type="number"
              min={0}
              step={50}
              defaultValue={initial.minPriceCents ? initial.minPriceCents / 100 : ""}
              placeholder="Min"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              disabled={isPending}
            />
            <input
              name="maxPrice"
              type="number"
              min={0}
              step={50}
              defaultValue={initial.maxPriceCents ? initial.maxPriceCents / 100 : ""}
              placeholder="Max"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              disabled={isPending}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Apply range
          </Button>
        </form>
      </div>

      <Button variant="ghost" onClick={resetFilters} disabled={isPending}>
        Reset filters
      </Button>
    </aside>
  );
}






