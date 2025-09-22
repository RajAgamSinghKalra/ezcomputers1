"use client";

import { useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CheckoutForm } from "@/components/checkout/checkout-form";

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string) {
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromiseCache.get(publishableKey)!;
}

export function CheckoutClient({
  clientSecret,
  publishableKey,
  amount,
  currency,
}: {
  clientSecret: string | null;
  publishableKey: string | null;
  amount: number;
  currency: string;
}) {
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      return null;
    }
    return getStripePromise(publishableKey);
  }, [publishableKey]);

  const options = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: {
        theme: "flat" as const,
        variables: {
          colorPrimary: "#ff7800",
          colorBackground: "#ffffff",
          colorText: "#1f2933",
          colorDanger: "#ef4444",
          borderRadius: 12,
        },
      },
    } satisfies Parameters<typeof Elements>[0]["options"];
  }, [clientSecret]);

  if (!publishableKey || !stripePromise) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-muted/40 p-6 text-sm text-foreground-muted">
        <p>Checkout is temporarily unavailable. Please contact support to complete your order.</p>
      </div>
    );
  }

  if (!clientSecret || !options) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-muted/40 p-6 text-sm text-foreground-muted">
        <p>Preparing secure payment session…</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm amount={amount} currency={currency} />
    </Elements>
  );
}

