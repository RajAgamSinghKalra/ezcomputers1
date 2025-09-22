import type { Stripe } from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export type CartForPayment = {
  id: string;
  totalCents: number;
  currency: string;
  paymentIntentId: string | null;
};

export type PaymentIntentMetadata = Record<string, string | number | null | undefined>;

function normalizeMetadata(metadata: PaymentIntentMetadata | undefined) {
  if (!metadata) return undefined;
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]),
  );
}

export async function ensureCartPaymentIntent(
  cart: CartForPayment,
  metadata?: PaymentIntentMetadata,
): Promise<Stripe.PaymentIntent> {
  if (cart.totalCents <= 0) {
    throw new Error("Cannot create a payment intent for an empty cart.");
  }

  const stripe = getStripeClient();
  const currency = cart.currency?.toLowerCase() ?? "usd";
  const meta = normalizeMetadata({ cartId: cart.id, ...metadata });

  if (cart.paymentIntentId) {
    const updated = await stripe.paymentIntents.update(cart.paymentIntentId, {
      amount: cart.totalCents,
      currency,
      metadata: meta,
    });

    return updated;
  }

  const created = await stripe.paymentIntents.create({
    amount: cart.totalCents,
    currency,
    metadata: meta,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "always",
    },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { paymentIntentId: created.id },
  });

  return created;
}

export async function clearCartPaymentIntent(cartId: string) {
  await prisma.cart.update({
    where: { id: cartId },
    data: { paymentIntentId: null },
  });
}
