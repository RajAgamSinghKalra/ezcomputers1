"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const paymentMethodSchema = z.enum(["card", "ach", "financing", "paypal"]);

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Provide a valid email"),
  company: z.string().optional(),
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500, "Please keep notes under 500 characters").optional(),
  guard: z.string().optional(),
});

const paymentOptions = [
  {
    value: "card" as const,
    label: "Credit / Debit Card",
    description: "Pay instantly with all major card brands via our PCI-DSS compliant gateway.",
  },
  {
    value: "ach" as const,
    label: "Bank Transfer (ACH)",
    description: "Authorize a secure bank transfer directly from your account.",
  },
  {
    value: "financing" as const,
    label: "Financing (Affirm)",
    description: "Split payments over time with our approved financing partners.",
  },
  {
    value: "paypal" as const,
    label: "PayPal",
    description: "Use your PayPal balance or linked funding sources without leaving the site.",
  },
];

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm({ amount, currency }: { amount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "card",
      guard: "",
    },
  });

  const watchPaymentMethod = watch("paymentMethod");

  const onSubmit = async (values: CheckoutFormValues) => {
    if (values.guard) {
      return;
    }
    if (!stripe || !elements) {
      setServerError("Secure payment is still initializing. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);
    setServerError(null);

    try {
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!checkoutResponse.ok) {
        const body = await checkoutResponse.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to start checkout session");
      }

      const { clientSecret, paymentIntentId } = await checkoutResponse.json();

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message ?? "Payment details need attention.");
      }

      const confirmation = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: values.name,
              email: values.email,
            },
          },
          receipt_email: values.email,
        },
        redirect: "if_required",
      });

      if (confirmation.error) {
        throw new Error(confirmation.error.message ?? "Payment could not be completed.");
      }

      const paymentIntent = confirmation.paymentIntent ?? (await stripe.retrievePaymentIntent(clientSecret)).paymentIntent;
      if (!paymentIntent) {
        throw new Error("Unable to verify payment status.");
      }

      const completionResponse = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id ?? paymentIntentId,
          name: values.name,
          email: values.email,
          company: values.company,
          notes: values.notes,
          paymentMethod: values.paymentMethod,
        }),
      });

      if (!completionResponse.ok) {
        const body = await completionResponse.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to finalize order.");
      }

      const completion = await completionResponse.json();
      reset({
        name: "",
        email: "",
        company: "",
        notes: "",
        paymentMethod: values.paymentMethod,
        guard: "",
      });
      router.push(`/checkout/success?order=${encodeURIComponent(completion.orderNumber ?? "")}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setServerError(error instanceof Error ? error.message : "Unexpected checkout error");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            {...register("name")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            placeholder="Morgan Sterling"
            autoComplete="name"
            disabled={isProcessing}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isProcessing}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="company">
          Company (optional)
        </label>
        <input
          id="company"
          {...register("company")}
          className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          placeholder="Studio or organization"
          autoComplete="organization"
          disabled={isProcessing}
        />
      </div>
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Payment method</span>
        <div className="grid gap-2">
          {paymentOptions.map((option) => {
            const selected = watchPaymentMethod === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-sm transition ${
                  selected ? "border-brand-500/70 bg-brand-500/5" : "border-border-soft bg-background"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register("paymentMethod")}
                  className="mt-1 h-4 w-4"
                  disabled={isProcessing}
                />
                <span>
                  <span className="font-semibold text-foreground">{option.label}</span>
                  <span className="block text-xs text-foreground-muted">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          {...register("notes")}
          className="w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 py-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          placeholder="Share delivery preferences, deadlines, or other details."
          disabled={isProcessing}
        />
        {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Secure payment</span>
        <div className="rounded-[var(--radius-md)] border border-border-soft bg-background p-4">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </div>

      <div className="sr-only" aria-hidden>
        <label htmlFor="checkout-guard">Leave this field empty</label>
        <input id="checkout-guard" type="text" tabIndex={-1} autoComplete="off" {...register("guard")} />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isProcessing} className="w-full">
        {isProcessing ? "Processing..." : `Complete payment (${(amount / 100).toLocaleString(undefined, { style: "currency", currency })})`}
      </Button>
      <p className="text-xs text-foreground-muted">
        We encrypt every transaction end-to-end. You&apos;ll receive an email confirmation with order tracking details as soon as processing completes.
      </p>
    </form>
  );
}
