import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { CATEGORY_LABELS, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/constants";
import { CompareToggle } from "@/components/compare/compare-toggle";
import { toCompareSnapshot } from "@/lib/comparison";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/cards/product-card";
import { StarRating } from "@/components/ratings/star-rating";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { authOptions } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Build not found" };
  }

  const canonicalUrl = `${SITE_URL}/prebuilt/${slug}`;
  const primaryImage = product.gallery[0]?.url ?? DEFAULT_OG_IMAGE;
  const description = product.shortDescription ?? product.headline ?? "High-performance PC build by EZComputers.";

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: product.name,
      description,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage(context: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.id);
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 5;

  const heroImage = product.gallery[0]?.url ?? "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";
  const compareProduct = toCompareSnapshot(product);

  const productImages = product.gallery.length ? product.gallery.map((image) => image.url) : [DEFAULT_OG_IMAGE];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: productImages,
    description: product.shortDescription ?? product.description,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "EZComputers",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.basePriceCents / 100).toFixed(2),
      availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/prebuilt/${product.slug}`,
    },
    aggregateRating: totalReviews
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating.toFixed(1),
          reviewCount: totalReviews,
        }
      : undefined,
    review: product.reviews.map((review) => ({
      "@type": "Review",
      name: review.title,
      reviewBody: review.body,
      datePublished: review.createdAt.toISOString(),
      author: {
        "@type": "Person",
        name: review.author ?? "Verified buyer",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
    })),
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="container grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-4 shadow-[var(--shadow-soft)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-background-muted">
              <Image src={heroImage} alt={product.name} fill priority className="object-cover" />
            </div>
            {product.gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.gallery.slice(1, 5).map((image) => (
                  <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-border-soft">
                    <Image src={image.url} alt={image.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Component overview</h2>
            <div className="space-y-4">
              {product.components.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-border-soft bg-background px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <span className="text-xs text-foreground-muted">{item.component.brand}</span>
                  </div>
                  <p className="text-sm text-foreground">{item.component.name}</p>
                  {item.summary && <p className="text-xs text-foreground-muted">{item.summary}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Technical specifications</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {product.specifications.map((spec) => (
                <div key={spec.id}>
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted">{spec.label}</dt>
                  <dd className="text-sm text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Badge>{CATEGORY_LABELS[product.category]}</Badge>
                {product.isFeatured && <Badge variant="outline">Featured</Badge>}
              </div>
              <h1 className="text-3xl font-semibold text-foreground">{product.name}</h1>
              {product.headline && <p className="text-sm text-foreground-muted">{product.headline}</p>}

              <div className="flex items-center gap-3">
                <StarRating value={averageRating} reviewsCount={totalReviews} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground-muted">Starting at</span>
                <div className="flex items-center gap-3 text-3xl font-semibold text-foreground">
                  {formatCurrencyFromCents(product.basePriceCents)}
                  {product.msrpCents && product.msrpCents > product.basePriceCents && (
                    <span className="text-base font-normal text-foreground-muted line-through">
                      {formatCurrencyFromCents(product.msrpCents)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <AddToCartButton productId={product.id} />
                <Button
                  className="w-full"
                  href={`/custom-builder?base=${product.slug}`}
                  size="lg"
                  variant="secondary"
                >
                  Customize this build
                </Button>
                <CompareToggle product={compareProduct} variant="default" />
              </div>

              <ul className="space-y-2 text-xs text-foreground-muted">
                <li>- 48-hour stability, thermal, and memory validation</li>
                <li>- Lifetime expert support with remote diagnostics</li>
                <li>- Secure checkout with financing options</li>
              </ul>
            </div>
          </div>

          <section className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Customer reviews</h2>
            {product.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-foreground-muted">No reviews yet. Be the first to share your experience.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {product.reviews.map((review) => (
                  <article key={review.id} className="rounded-[var(--radius-md)] border border-border-soft bg-background p-4">
                    <StarRating value={review.rating} className="text-xs" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">{review.title}</h3>
                    <p className="mt-2 text-sm text-foreground-muted">{review.body}</p>
                    <p className="mt-3 text-xs text-foreground-muted">- {review.author ?? "Verified buyer"}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="container py-10">
        {session?.user ? (
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Write a review</h2>
            <p className="text-xs text-foreground-muted">Share your experience with this build.</p>
            <div className="mt-4">
              <ReviewForm slug={slug} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">Log in to leave a review.</p>
        )}
      </section>

      {related.length > 0 && (
        <section className="bg-background-muted py-16">
          <div className="container space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Explore related systems</h2>
              <Button href="/prebuilt" size="sm" variant="outline">
                Browse all
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

