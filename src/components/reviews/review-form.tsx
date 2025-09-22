"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title is required"),
  body: z.string().min(20, "Review should be at least 20 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    startTransition(async () => {
      const response = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        reset({ rating: 5, title: "", body: "" });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="flex items-center gap-3">
        <label htmlFor="rating" className="text-sm text-foreground">
          Rating
        </label>
        <select
          id="rating"
          {...register("rating", { valueAsNumber: true })}
          className="h-10 rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          disabled={isPending}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
        {errors.rating && <p className="text-xs text-red-500">{errors.rating.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          {...register("title")}
          className="h-10 w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          placeholder="Summarize your experience"
          disabled={isPending}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground-muted" htmlFor="body">
          Review
        </label>
        <textarea
          id="body"
          rows={4}
          {...register("body")}
          className="w-full rounded-[var(--radius-md)] border border-border-soft bg-background px-3 py-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          placeholder="Share performance impressions, build quality, acoustics, etc."
          disabled={isPending}
        />
        {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}

