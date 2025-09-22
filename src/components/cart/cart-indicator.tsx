"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const CART_SUMMARY_QUERY_KEY = ["cart-summary"] as const;

type CartSummaryResponse = {
  count: number;
  subtotalCents: number;
};

async function fetchCartSummary(): Promise<CartSummaryResponse> {
  const response = await fetch("/api/cart/summary", {
    method: "GET",
    credentials: "include",
    headers: {
      "Cache-Control": "no-store",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load cart summary");
  }

  return response.json();
}

export function CartIndicator({ className }: { className?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: CART_SUMMARY_QUERY_KEY,
    queryFn: fetchCartSummary,
    staleTime: 20_000,
    refetchInterval: 60_000,
  });

  const count = data?.count ?? 0;

  return (
    <span
      className={cn(
        "ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500/90 px-2 text-xs font-semibold text-white",
        className,
        count === 0 && "bg-border-soft text-foreground-muted",
      )}
      aria-live="polite"
    >
      {isLoading ? 0 : count}
    </span>
  );
}

export function useInvalidateCartSummary() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CART_SUMMARY_QUERY_KEY });
}
