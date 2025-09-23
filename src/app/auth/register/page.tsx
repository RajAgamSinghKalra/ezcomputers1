"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TurnstileField } from "@/components/forms/turnstile-field";
import { HoverPrefetchLink } from "@/components/navigation/prefetch-link";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  guard: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { guard: "" } });

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((value) => value + 1);
  };

  const onSubmit = (values: RegisterValues) => {
    setAuthError(null);
    startTransition(async () => {
      if (values.guard) {
        return;
      }
      if (siteKey && !turnstileToken) {
        setAuthError("Please complete the verification challenge.");
        return;
      }
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken }),
      });

      if (response.ok) {
        reset({ guard: "" });
        resetTurnstile();
        router.push("/auth/login");
      } else {
        const data = await response.json().catch(() => ({}));
        setAuthError(data.error ?? "Unable to create account");
        resetTurnstile();
      }
    });
  };

  return (
    <div className="container flex max-w-md flex-col gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-foreground-muted">Save builds, track orders, and access lifetime support faster.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            autoComplete="name"
            {...register("name")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
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
            autoComplete="email"
            {...register("email")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {siteKey ? (
          <div className="rounded-[var(--radius-md)] border border-border-soft bg-background p-3">
            <TurnstileField
              key={turnstileKey}
              siteKey={siteKey}
              action="register"
              onToken={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
            />
          </div>
        ) : null}

        {authError && <p className="text-xs text-red-500">{authError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-center text-xs text-foreground-muted">
        Already have an account? <HoverPrefetchLink href="/auth/login" className="text-brand-500 hover:text-brand-400">Sign in</HoverPrefetchLink>
      </p>
    </div>
  );
}
