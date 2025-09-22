import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatCurrencyFromCents } from "@/lib/formatters";


import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

export type CartItemDTO = {
  id: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  product: {
    id: string;
    name: string;
        const image = item.product?.image ?? FALLBACK_PRODUCT_IMAGE;

    image: string;
  } | null;
  customBuild: {
    id: string;
    name: string;
    slug: string;
    components: Array<{ kind: string; name: string }>;
  } | null;
};

export function CartItems({ items }: { items: CartItemDTO[] }) {
  const [isPending, startTransition] = useTransition();

  const updateQuantity = (itemId: string, quantity: number) => {
    startTransition(async () => {
      await fetch("/api/cart/update-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      window.location.reload();
    });
  };

  const removeItem = (itemId: string) => {
    startTransition(async () => {
      await fetch("/api/cart/remove-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const key = item.id;
        const title = item.product?.name ?? item.customBuild?.name ?? "Custom build";
        const href = item.product ? `/prebuilt/${item.product.slug}` : item.customBuild ? `/custom-builder?view=${item.customBuild.slug}` : "#";
        const image = item.product?.image ?? "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
        return (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border-soft bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex w-full items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-[var(--radius-md)] border border-border-soft bg-background-muted">
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <Link href={href} className="font-semibold text-foreground hover:text-brand-500">
                  {title}
                </Link>
                {item.customBuild && (
                  <ul className="flex flex-wrap gap-2 text-xs text-foreground-muted">
                    {item.customBuild.components.slice(0, 4).map((component) => (
                      <li key={`${item.id}-${component.kind}`} className="rounded-full bg-background-muted px-2 py-1">
                        {component.kind}: {component.name}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  <span>Unit price {formatCurrencyFromCents(item.unitPriceCents)}</span>
                  <span>-</span>
                  <span>Line total {formatCurrencyFromCents(item.lineTotalCents)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 md:flex-col">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft text-sm"
                  disabled={isPending}
                >
                  -
                </button>
                <span className="min-w-[2ch] text-center text-sm text-foreground">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-soft text-sm"
                  disabled={isPending}
                >
                  +
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={isPending}
                className="gap-2 text-red-500 hover:text-red-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span>Remove</span>
                  </>
                )}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

