"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ezc-newsletter-dismissed";

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "dismissed") return;

    const timer = window.setTimeout(() => setIsOpen(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const close = (persist = true) => {
    setIsOpen(false);
    if (persist && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "modal", guard: "" }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setStatus("success");
      close();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter sign up"
    >
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-[var(--shadow-strong)]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => close()}
          aria-label="Close newsletter prompt"
          className="absolute right-4 top-4 gap-2 rounded-full border border-border-soft px-3 text-xs text-foreground-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
          <span>Close</span>
        </Button>
        <div className="space-y-3 pr-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Stay ahead</p>
          <h2 className="text-2xl font-semibold text-foreground">Get build drops, exclusive bundles, and tuning tips.</h2>
          <p className="text-sm text-foreground-muted">
            Subscribe for monthly insights from our lab - new product launches, overclocking profiles, and limited-run gear.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            autoComplete="email"
          />
          <Button type="submit" className="w-full" disabled={status === "submitting"}>
            {status === "submitting" ? "Joining..." : "Join the list"}
          </Button>
        </form>
        <p className="mt-3 text-xs text-foreground-muted">
          No spam - just the good stuff. Unsubscribe anytime.
        </p>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
