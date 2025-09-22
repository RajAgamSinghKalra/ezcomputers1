"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TurnstileField } from "@/components/forms/turnstile-field";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Provide a valid email"),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(20, "Please include at least 20 characters"),
  guard: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactSchema>;

type SubmissionState = "idle" | "success" | "error";

export function ContactForm({ className }: { className?: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { guard: "" },
  });

  const [status, setStatus] = useState<SubmissionState>("idle");
  const [isPending, startTransition] = useTransition();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((value) => value + 1);
  };

  const onSubmit = (input: ContactFormInput) => {
    setStatus("idle");
    startTransition(async () => {
      if (input.guard) {
        return;
      }
      if (siteKey && !turnstileToken) {
        setStatus("error");
        return;
      }
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input, turnstileToken }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        setStatus("success");
        reset({ guard: "" });
        resetTurnstile();
      } catch (error) {
        console.error(error);
        setStatus("error");
        resetTurnstile();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            placeholder="Your full name"
            autoComplete="name"
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
            {...register("email")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPending}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="subject">
            Subject (optional)
          </label>
          <input
            id="subject"
            {...register("subject")}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            placeholder="How can we help?"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          {...register("message")}
          className="w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 py-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          placeholder="Tell us about your project, timeline, and hardware requirements."
          disabled={isPending}
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      {siteKey ? (
        <div className="rounded-[var(--radius-md)] border border-border-soft bg-background p-3">
          <TurnstileField
            key={turnstileKey}
            siteKey={siteKey}
            action="contact"
            onToken={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>We respond within one business day.</span>
        {status === "success" && <span className="text-emerald-500">Message received! We&rsquo;ll be in touch soon.</span>}
        {status === "error" && <span className="text-red-500">Something went wrong. Please try again.</span>}
      </div>
      <input type="text" aria-hidden tabIndex={-1} autoComplete="off" className="sr-only" {...register("guard")} />

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
