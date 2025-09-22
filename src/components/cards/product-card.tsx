import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductWithRelations } from "@/lib/data/products";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { CATEGORY_LABELS, FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { toCompareSnapshot } from "@/lib/comparison";
import { StarRating } from "@/components/ratings/star-rating";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: ProductWithRelations; className?: string }) {
  const heroImage = product.gallery[0]?.url ?? FALLBACK_PRODUCT_IMAGE;
  const totalReviews = product.reviews.length;
  const compareProduct = toCompareSnapshot(product);
  const averageRating = totalReviews
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 5;

  const highlights = product.specifications.slice(0, 3);

  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-soft bg-background shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-muted">
        <Image
          src={heroImage}
          alt={product.name}
          fill
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <Badge>{CATEGORY_LABELS[product.category]}</Badge>
          {product.isFeatured && <Badge variant="outline">Featured Build</Badge>}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-background/90 px-4 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          {formatCurrencyFromCents(product.basePriceCents)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <Link href={`/prebuilt/${product.slug}`} className="block">
            <h3 className="text-lg font-semibold text-foreground transition group-hover/card:text-brand-500">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-foreground-muted line-clamp-2">{product.shortDescription}</p>
        </div>

        <div className="space-y-3 text-sm text-foreground-muted">
          <div className="flex flex-wrap gap-2">
            {highlights.map((item) => (
              <span
                key={`${product.id}-${item.label}`}
                className="rounded-full bg-background-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {item.value}
              </span>
            ))}
          </div>
          <StarRating value={averageRating} reviewsCount={totalReviews} />
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-foreground-muted">
              <span className="font-semibold text-foreground">
                {formatCurrencyFromCents(product.basePriceCents)}
              </span>
              {product.msrpCents && product.msrpCents > product.basePriceCents && (
                <span className="ml-2 text-xs text-foreground-muted line-through">
                  {formatCurrencyFromCents(product.msrpCents)}
                </span>
              )}
            </div>
            <Link
              href={`/prebuilt/${product.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand-500 hover:text-brand-500"
            >
              View Build
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="flex justify-end">
            <CompareToggle product={compareProduct} />
          </div>
        </div>
      </div>
    </article>
  );
}

