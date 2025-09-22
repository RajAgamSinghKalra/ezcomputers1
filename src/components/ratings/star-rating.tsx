import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, reviewsCount, className }: { value: number; reviewsCount?: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(5, value));
  const fullStars = Math.floor(safeValue);
  const hasHalf = safeValue - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < fullStars || (index === fullStars && hasHalf);
          return (
            <Star
              key={index}
              className={cn(
                "h-4 w-4",
                filled ? "fill-brand-500 text-brand-500" : "text-foreground-muted",
              )}
            />
          );
        })}
      </div>
      <span className="text-foreground-muted">
        {safeValue.toFixed(1)}
        {typeof reviewsCount === "number" && reviewsCount > 0 && ` - ${reviewsCount} review${reviewsCount === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}

