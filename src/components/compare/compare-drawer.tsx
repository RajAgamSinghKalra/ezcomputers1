"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompare } from "@/components/providers/compare-provider";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatCurrencyFromCents } from "@/lib/formatters";

const FIELDS = ["Price", "CPU", "GPU", "Memory", "Storage", "Form Factor", "Cooling"] as const;

export function CompareDrawer() {
  const { items, remove, clear } = useCompare();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (items.length < 2) {
      setIsExpanded(false);
    }
  }, [items.length]);

  const comparisonRows = useMemo(() => {
    return FIELDS.map((field) => ({
      label: field,
      values: items.map((item) => {
        if (field === "Price") {
          return formatCurrencyFromCents(item.priceCents);
        }
        return item.specs[field] ?? "--";
      }),
    }));
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex max-w-full flex-col gap-3">
      <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Build comparison</p>
            <p className="text-xs text-foreground-muted">Select up to three systems to compare side-by-side.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">{items.length}/3</span>
            <button
              type="button"
              onClick={() => clear()}
              className="text-xs text-foreground-muted underline"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex items-center gap-2 rounded-[var(--radius-md)] border border-border-soft bg-background px-2 py-2 text-xs"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-[var(--radius-sm)] bg-background-muted">
                <Image
                  src={item.heroImage ?? FALLBACK_PRODUCT_IMAGE}
                  alt={item.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{item.name}</span>
                <span className="text-foreground-muted">{formatCurrencyFromCents(item.priceCents)}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="absolute -right-3 -top-3 inline-flex items-center gap-1 rounded-full border border-border-soft bg-background px-2 py-1 text-[11px] font-semibold text-foreground-muted transition hover:text-foreground"
                aria-label={`Remove ${item.name} from comparison`}
              >
                <X className="h-3 w-3" aria-hidden />
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-foreground-muted">Add more systems from the catalog to compare.</span>
          <Button size="sm" onClick={() => setIsExpanded(true)} disabled={items.length < 2}>
            Open comparison
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] border border-border-soft bg-background shadow-[var(--shadow-strong)]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              aria-label="Close comparison"
              className="absolute right-4 top-4 gap-2 rounded-full border border-border-soft px-3 text-xs text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
              <span>Close</span>
            </Button>
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-foreground">System comparison</h2>
              <p className="text-sm text-foreground-muted">
                Review key specs, pricing, and categories side-by-side. Select a build to explore full details.
              </p>
            </div>
            <div className="overflow-x-auto px-6 pb-6">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-40 border border-border-soft bg-background-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Spec
                    </th>
                    {items.map((item) => (
                      <th key={item.id} className="min-w-[220px] border border-border-soft px-4 py-3 text-left">
                        <div className="flex flex-col gap-1">
                          <Link href={`/prebuilt/${item.slug}`} className="text-sm font-semibold text-foreground hover:text-brand-500">
                            {item.name}
                          </Link>
                          {item.headline && <span className="text-xs text-foreground-muted">{item.headline}</span>}
                          <span className="text-xs uppercase text-foreground-muted">{item.category.replace("_", " ")}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th className="border border-border-soft bg-background-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                        {row.label}
                      </th>
                      {row.values.map((value, index) => (
                        <td key={`${row.label}-${items[index]?.id ?? index}`} className="border border-border-soft px-4 py-3 text-sm text-foreground">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
