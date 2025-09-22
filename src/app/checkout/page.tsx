import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { ensureCartPaymentIntent } from "@/lib/payments";
import { getStripeClient } from "@/lib/stripe";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
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
          product: true,
          customBuild: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
  const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && publishableKey);
  let clientSecret: string | null = null;

  if (isStripeConfigured && cart.totalCents > 0) {
    try {
      const paymentIntent = await ensureCartPaymentIntent(
        {
          id: cart.id,
          totalCents: cart.totalCents,
          currency: cart.currency,
          paymentIntentId: cart.paymentIntentId,
        },
        {
          user_id: session?.user?.id ?? undefined,
        },
      );

      clientSecret = paymentIntent.client_secret;
      if (!clientSecret) {
        const refreshed = await getStripeClient().paymentIntents.retrieve(paymentIntent.id);
        clientSecret = refreshed.client_secret ?? null;
      }
    } catch (error) {
      console.error("Unable to initialize payment intent", error);
    }
  }

  const totalCents = cart.totalCents;
  const currency = (cart.currency ?? "USD").toUpperCase();

  return (
    <div className="container grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Checkout</h1>
          <p className="text-sm text-foreground-muted">
            Provide your contact details and we&apos;ll coordinate secure payment and delivery.
          </p>
        </div>
        <CheckoutClient
          clientSecret={clientSecret}
          publishableKey={publishableKey}
          amount={totalCents}
          currency={currency}
        />
      </section>
      <aside className="h-fit rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm text-foreground-muted">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.product?.name ?? item.customBuild?.name ?? "Custom build"} × {item.quantity}
              </span>
              <span className="text-foreground">{formatCurrencyFromCents(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-border-soft pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Subtotal</span>
            <span>{formatCurrencyFromCents(cart.subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Estimated tax</span>
            <span className="text-foreground-muted">Calculated post-payment</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total due</span>
            <span>{formatCurrencyFromCents(cart.totalCents)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
