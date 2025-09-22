import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { CartItems } from "@/components/cart/cart-items";

export const metadata = {
  title: "Your Cart",
};

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const cartSessionId = cookieStore.get("cart_session")?.value;

  const cart = await prisma.cart.findFirst({
    where: session?.user?.id
      ? { userId: session.user.id }
      : cartSessionId
      ? { sessionId: cartSessionId }
      : { id: "" },
    include: {
      items: {
        include: {
          product: {
            include: {
              gallery: {
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
          customBuild: {
            include: {
              components: {
                include: {
                  component: true,
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="max-w-md text-sm text-foreground-muted">
          Explore our pre-built systems or design a custom rig to add items to your cart.
        </p>
        <div className="flex gap-3">
          <Button href="/prebuilt">Shop pre-built PCs</Button>
          <Button href="/custom-builder" variant="secondary">
            Launch custom builder
          </Button>
        </div>
      </div>
    );
  }

  const summary = {
    subtotalCents: cart.subtotalCents,
    totalCents: cart.totalCents,
  };

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.lineTotalCents,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.gallery[0]?.url ?? FALLBACK_PRODUCT_IMAGE,
        }
      : null,
    customBuild: item.customBuild
      ? {
          id: item.customBuild.id,
          name: item.customBuild.name,
          slug: item.customBuild.slug,
          components: item.customBuild.components.map((component) => ({
            kind: component.kind,
            name: component.component.name,
          })),
        }
      : null,
  }));

  return (
    <div className="container grid gap-10 py-16 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-foreground">Your cart</h1>
        <CartItems items={cartItems} />
      </div>
      <aside className="h-fit rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm text-foreground">
          <div className="flex items-center justify-between">
            <dt className="text-foreground-muted">Subtotal</dt>
            <dd>{formatCurrencyFromCents(summary.subtotalCents)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-foreground-muted">Estimated tax</dt>
            <dd className="text-foreground-muted">Calculated at checkout</dd>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrencyFromCents(summary.totalCents)}</dd>
          </div>
        </dl>
        <Button className="mt-6 w-full" href="/checkout" size="lg">
          Proceed to checkout
        </Button>
        <p className="mt-3 text-xs text-foreground-muted">
          Checkout is fully secured. You&apos;ll review order details before payment.
        </p>
      </aside>
    </div>
  );
}
