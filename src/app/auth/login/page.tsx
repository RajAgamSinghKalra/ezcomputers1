"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HoverPrefetchLink } from "@/components/navigation/prefetch-link";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  twoFactorCode: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginValues) => {
    setAuthError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        code: values.twoFactorCode,
        redirect: false,
      });

      if (result?.error) {
        setAuthError(result.error);
        return;
      }

      router.push("/account/orders");
      router.refresh();
    });
  };

  return (
    <div className="container flex max-w-md flex-col gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Log in to EZComputers</h1>
        <p className="text-sm text-foreground-muted">Access saved builds, track orders, and manage your profile.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            autoComplete="current-password"
            {...register("password")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="twoFactorCode">
            Two-factor code (if enabled)
          </label>
          <input
            id="twoFactorCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456 or backup code"
            {...register("twoFactorCode")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            disabled={isPending}
          />
          {errors.twoFactorCode && <p className="text-xs text-red-500">{errors.twoFactorCode.message}</p>}
        </div>
        {authError && <p className="text-xs text-red-500">{authError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-xs text-foreground-muted">
        New here? <HoverPrefetchLink href="/auth/register" className="text-brand-500 hover:text-brand-400">Create an account</HoverPrefetchLink>
      </p>
    </div>
  );
}
