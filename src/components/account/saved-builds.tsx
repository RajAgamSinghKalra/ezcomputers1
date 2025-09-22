"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

type SavedBuild = {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  estimatedWattage: number | null;
  totalPriceCents: number;
  updatedAt: string;
  components: Array<{
    kind: string;
    name: string;
    brand: string;
  }>;
};

export function SavedBuildsList({ builds }: { builds: SavedBuild[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = (buildId: string) => {
    setFeedback(null);
    setError(null);
    setPendingId(buildId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/custom-builder/add-existing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buildId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Unable to add build to cart");
        }
        setFeedback("Build added to cart.");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to add build to cart");
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleCopyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/custom-builder?build=${slug}`);
      setFeedback("Shareable link copied to clipboard.");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to copy link. Try again.");
    }
  };

  if (builds.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-muted/50 p-8 text-sm text-foreground-muted">
        <p>You haven&apos;t saved any custom builds yet. Launch the builder to start crafting configs.</p>
        <Button asChild className="mt-4">
          <Link href="/custom-builder">Open custom builder</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(feedback || error) && (
        <div className="rounded-[var(--radius-md)] border border-border-soft bg-background p-3 text-sm">
          {feedback && <p className="text-emerald-500">{feedback}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
      <div className="grid gap-4">
        {builds.map((build) => (
          <article
            key={build.id}
            className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{build.name}</h2>
                <p className="text-xs text-foreground-muted">Updated {new Date(build.updatedAt).toLocaleDateString()}</p>
                {build.summary && <p className="mt-1 text-sm text-foreground-muted">{build.summary}</p>}
              </div>
              <div className="text-right text-sm text-foreground">
                <p className="font-semibold">{formatCurrencyFromCents(build.totalPriceCents)}</p>
                {build.estimatedWattage ? (
                  <p className="text-xs text-foreground-muted">Estimated wattage {build.estimatedWattage} W</p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground-muted">
              {build.components.map((component) => (
                <span
                  key={`${build.id}-${component.kind}-${component.name}`}
                  className="rounded-full bg-background px-3 py-1"
                >
                  {component.kind}: {component.name}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={`/custom-builder?build=${build.slug}`}>Open in builder</Link>
              </Button>
              <Button
                onClick={() => handleAddToCart(build.id)}
                disabled={isPending && pendingId === build.id}
              >
                {isPending && pendingId === build.id ? "Adding..." : "Add to cart"}
              </Button>
              <Button variant="ghost" onClick={() => handleCopyLink(build.slug)} disabled={isPending}>
                Copy share link
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
