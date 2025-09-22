"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [optimisticSort, setOptimisticSort] = useState<string | null>(null);
  const [optimisticCategory, setOptimisticCategory] = useState<ProductCategory | null | undefined>(undefined);
  const [searchValue, setSearchValue] = useState(initial.search ?? "");
  const [minPriceInput, setMinPriceInput] = useState(() => formatCentsForInput(initial.minPriceCents));
  const [maxPriceInput, setMaxPriceInput] = useState(() => formatCentsForInput(initial.maxPriceCents));

  const searchParamsKey = searchParams.toString();
  const activeSortParam = searchParams.get("sort");
  const activeSort = sortOptions.some((option) => option.value === activeSortParam)
    ? (activeSortParam as string)
    : initial.sort ?? "featured";
  const displayedSort = optimisticSort ?? activeSort;

  const activeCategoryParam = searchParams.get("category");
  const activeCategory = (activeCategoryParam ?? initial.category ?? undefined) as ProductCategory | undefined;
  const normalizedActiveCategory = activeCategory ?? null;
  const displayedCategory = optimisticCategory !== undefined ? optimisticCategory : normalizedActiveCategory;
  const currentHref = searchParamsKey.length > 0 ? `${pathname}?${searchParamsKey}` : pathname;

  const buildQuery = useCallback(
    (
      overrides: Partial<{
        category: ProductCategory | null | undefined;
        sort: string | null | undefined;
        search: string | null | undefined;
        minPriceCents: number | null | undefined;
        maxPriceCents: number | null | undefined;
      }>,
    ) => {
      const params = new URLSearchParams(searchParamsKey);
      const queryKeyMap = {
        category: "category",
        sort: "sort",
        search: "q",
        minPriceCents: "min",
        maxPriceCents: "max",
      } as const;

      (Object.keys(overrides) as Array<keyof typeof queryKeyMap>).forEach((key) => {
        const value = overrides[key];
        const queryKey = queryKeyMap[key];
        if (!queryKey) return;

        if (value === undefined || value === null || value === "") {
          params.delete(queryKey);
        } else {
          const serializedValue = typeof value === "number" ? String(value) : value;
          params.set(queryKey, serializedValue);
        }
      });

      const queryString = params.toString();
      return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
    },
    [pathname, searchParamsKey],
  );

  const navigateTo = useCallback(
    (targetHref: string) => {
      if (targetHref === currentHref) {
        return false;
      }

      setIsNavigating(true);
      router.push(targetHref);
      return true;
    },
    [currentHref, router],
  );

  useEffect(() => {
    setIsNavigating(false);
    setOptimisticSort(null);
    setOptimisticCategory(undefined);
  }, [searchParamsKey]);

  useEffect(() => {
    setSearchValue(initial.search ?? "");
  }, [initial.search]);

  useEffect(() => {
    setMinPriceInput(formatCentsForInput(initial.minPriceCents));
  }, [initial.minPriceCents]);

  useEffect(() => {
    setMaxPriceInput(formatCentsForInput(initial.maxPriceCents));
  }, [initial.maxPriceCents]);

  const handleSortChange = (value: string) => {
    setOptimisticSort(value);
    if (!navigateTo(buildQuery({ sort: value }))) {
      setOptimisticSort(null);
    }
  };

  const handleCategoryClick = (category?: ProductCategory) => {
    const selection = category ?? null;
    setOptimisticCategory(selection);
    if (!navigateTo(buildQuery({ category: selection }))) {
      setOptimisticCategory(undefined);
    }
  };

  const handleRangeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const minCents = parsePriceToCents(minPriceInput);
    const maxCents = parsePriceToCents(maxPriceInput);

    setMinPriceInput(formatCentsForInput(minCents));
    setMaxPriceInput(formatCentsForInput(maxCents));

    navigateTo(
      buildQuery({
        minPriceCents: minCents ?? null,
        maxPriceCents: maxCents ?? null,
      }),
    );
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    setSearchValue(trimmed);
    navigateTo(buildQuery({ search: trimmed.length > 0 ? trimmed : null }));
  };

  const resetFilters = () => {
    setSearchValue("");
    setMinPriceInput("");
    setMaxPriceInput("");
    const didNavigate = navigateTo(pathname);
    if (didNavigate) {
      setOptimisticCategory(null);
      setOptimisticSort("featured");
    } else {
      setOptimisticCategory(undefined);
      setOptimisticSort(null);
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMinPriceInput(event.target.value);
  };

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaxPriceInput(event.target.value);
  };

  return (
    <aside className="flex flex-col gap-8 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Search</span>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            name="q"
            value={searchValue}
            placeholder="Search builds"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            onChange={handleSearchChange}
            disabled={isNavigating}
          />
          <Button type="submit" variant="secondary" disabled={isNavigating}>
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
            disabled={isNavigating}
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
              disabled={isNavigating}
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
              disabled={isNavigating}
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
              value={minPriceInput}
              placeholder="Min"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              onChange={handleMinPriceChange}
              disabled={isNavigating}
            />
            <input
              name="maxPrice"
              type="number"
              min={0}
              step={50}
              value={maxPriceInput}
              placeholder="Max"
              className="h-11 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              onChange={handleMaxPriceChange}
              disabled={isNavigating}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isNavigating}>
            Apply range
          </Button>
        </form>
      </div>

      <Button variant="ghost" onClick={resetFilters} disabled={isNavigating}>
        Reset filters
      </Button>
    </aside>
  );
}

function parsePriceToCents(value: string) {
  if (!value) return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return undefined;
  return Math.round(numeric * 100);
}

function formatCentsForInput(value: number | null | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  const dollars = value / 100;
  if (Number.isInteger(dollars)) {
    return String(dollars);
  }

  return dollars.toFixed(2);
}






