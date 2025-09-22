"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { CART_SUMMARY_QUERY_KEY } from "@/components/cart/cart-indicator";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId, quantity = 1 }: { productId: string; quantity?: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    startTransition(async () => {
      await fetch("/api/cart/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      router.refresh();
      queryClient.invalidateQueries({ queryKey: CART_SUMMARY_QUERY_KEY });
    });
  };

  return (
    <Button size="lg" className="w-full" onClick={handleAdd} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />}
      {isPending ? "Adding..." : "Add to cart"}
    </Button>
  );
}

