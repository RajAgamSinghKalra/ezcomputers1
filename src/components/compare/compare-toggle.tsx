"use client";

import { GitCompare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/components/providers/compare-provider";
import type { CompareProductSnapshot } from "@/lib/comparison";

export function CompareToggle({
  product,
  variant = "compact",
}: {
  product: CompareProductSnapshot;
  variant?: "compact" | "default";
}) {
  const { isSelected, toggle } = useCompare();
  const selected = isSelected(product.id);

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => toggle(product)}
        className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-background px-3 py-1 text-xs font-semibold text-foreground-muted transition hover:border-brand-500 hover:text-brand-500"
        aria-pressed={selected}
      >
        {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : <GitCompare className="h-3.5 w-3.5" aria-hidden />} Compare
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "outline"}
      onClick={() => toggle(product)}
      className="gap-2"
      aria-pressed={selected}
    >
      {selected ? <Check className="h-4 w-4" aria-hidden /> : <GitCompare className="h-4 w-4" aria-hidden />} Compare build
    </Button>
  );
}
