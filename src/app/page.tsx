import Link from "next/link";
import { Shield, Sparkles, Wrench, Zap } from "lucide-react";
import { getFeaturedProducts, getCategoriesWithCounts } from "@/lib/data/products";
import { CATEGORY_BLURBS, CATEGORY_LABELS } from "@/lib/constants";
import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Average turnaround", value: "7 biz days" },
  { label: "Thermal margin", value: "-18 deg C vs OEM" },
  { label: "Pass rate", value: "48h burn-in" },
  { label: "Warranty", value: "3 years" },
];

const testimonials = [
  {
    quote:
      "Frame pacing is butter-smooth and the build quality honestly outclasses every other boutique system I've owned.",
    name: "Morgan H.",
    role: "Esports coach & content creator",
  },
  {
    quote:
      "They tuned BIOS, Windows, and even my creative toolbox so the workstation was production-ready right out of the crate.",
    name: "Lara B.",
    role: "Senior motion designer",
  },
];

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(3),
    getCategoriesWithCounts(),
  ]);

  const categoryCards = categories
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((entry) => ({
      label: CATEGORY_LABELS[entry.category],
      blurb: CATEGORY_BLURBS[entry.category],
      href: `/prebuilt?category=${entry.category}`,
      count: entry.count,
    }));

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background-muted">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,120,0,0.25),transparent_60%)]" />
        <div className="container grid gap-10 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="w-fit bg-background/80 backdrop-blur">
              Power | Precision | Ready
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Elite pre-built PCs and custom rigs engineered for gamers, creators, and innovators.
            </h1>
            <p className="max-w-2xl text-lg text-foreground-muted">
              EZComputers blends meticulously curated components, thermal-first architecture, and obsessive quality control so you can deploy the perfect system without the guesswork.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/prebuilt" size="lg">Shop Pre-Built PCs</Button>
              <Button href="/custom-builder" size="lg" variant="outline">Launch Custom Builder</Button>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-4 shadow-sm">
                  <dt className="text-xs uppercase tracking-wide text-foreground-muted">{stat.label}</dt>
                  <dd className="mt-1 text-xl font-semibold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden h-full lg:block">
            <div className="absolute inset-0 -translate-x-8 rounded-[var(--radius-lg)] bg-gradient-to-br from-brand-500/20 to-brand-500/0 blur-3xl" />
            <div className="relative rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated/90 p-8 shadow-[var(--shadow-strong)] backdrop-blur">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-10 w-10 text-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Thermally tuned from day one</p>
                    <p className="text-xs text-foreground-muted">
                      Custom fan curves, BIOS updates, and stability validation ensure headroom without noise.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-10 w-10 text-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Lifetime build support</p>
                    <p className="text-xs text-foreground-muted">
                      Real technicians. Real diagnostics. Firmware, OS, and component guidance for the lifecycle.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-10 w-10 text-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Secure checkout & warranty</p>
                    <p className="text-xs text-foreground-muted">
                      PCI-DSS compliant payments, 3-year warranty baseline, and optional white-glove on-site service.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-10 w-10 text-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ready for what&apos;s next</p>
                    <p className="text-xs text-foreground-muted">
                      PCIe 5.0, Wi-Fi 7, modular power delivery, and BIOS profiles keep upgrades frictionless.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="section-title">Choose your lane</h2>
            <p className="section-subtitle">
              Curated categories engineered for different workloads. Explore handpicked configurations or filter to match your exact requirements.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/prebuilt">Browse all systems</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
                <span className="rounded-full bg-background-muted px-3 py-1 text-xs font-medium text-foreground-muted">
                  {category.count} builds
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground-muted">{category.blurb}</p>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-brand-500">
                Explore builds ?
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-background-muted py-20">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="section-title">Flagship systems in the spotlight</h2>
              <p className="section-subtitle">
                Premium rigs our team can ship immediately. Every build is validated with 48-hour thermal, memory, and GPU stress testing.
              </p>
            </div>
            <Button href="/prebuilt">View all pre-builts</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge>Custom Builder</Badge>
            <h2 className="section-title">Design a bespoke rig with live compatibility intelligence.</h2>
            <p className="section-subtitle">
              Our guided builder filters parts in real-time based on chipset, power envelope, airflow budget, and thermal headroom-so incompatible selections never slip through.
            </p>
            <ul className="space-y-4 text-sm text-foreground-muted">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                Intelligent compatibility guards ensure CPU, motherboard, memory, and cooling combinations always align.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                Live pricing, wattage estimations, and noise projections adapt as you build.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                Save multiple configurations to your account, export spec sheets, or share builds with teammates.
              </li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button href="/custom-builder">Start building</Button>
              <Button href="/support" variant="ghost">View builder FAQs</Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <div className="rounded-[var(--radius-md)] border border-dashed border-brand-500/40 bg-background-muted/60 p-6 text-sm text-foreground-muted">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-foreground-muted">
                <span>Build summary</span>
                <span className="text-brand-500">Live sync</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">CPU</span>
                  <span className="text-foreground-muted">Select a processor</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">GPU</span>
                  <span className="text-foreground-muted">System suggests RTX 4080 Super</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Estimated wattage</span>
                  <span className="text-foreground">650 W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Projected total</span>
                  <span className="text-foreground font-semibold">$3,280</span>
                </div>
              </div>
              <div className="mt-6 rounded-[var(--radius-md)] bg-brand-500/10 px-4 py-3 text-xs text-brand-600">
                Intelligent filters hide incompatible choices as you design. Save builds to revisit or checkout instantly.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-muted py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-4">
            <Badge variant="outline">Customer stories</Badge>
            <h2 className="section-title">Trusted by competitive players, creative studios, and fast-scaling teams.</h2>
            <p className="section-subtitle">
              We build beyond spec sheets-calibrating firmwares, drivers, and OS for the exact workloads you run daily.
            </p>
          </div>
          <div className="grid gap-6">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm"
              >
                <p className="text-base text-foreground">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-4 text-sm text-foreground-muted">
                  {item.name} | {item.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <h3 className="text-2xl font-semibold text-foreground">Enterprise & creator partnerships</h3>
            <p className="mt-3 text-sm text-foreground-muted">
              Need a fleet of matched workstations or dedicated support? Our solutions team designs rollouts with imaging, asset tagging, and proactive monitoring baked in.
            </p>
            <Button href="/contact" className="mt-6">Talk with our solutions team</Button>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <h3 className="text-2xl font-semibold text-foreground">24/7 expert support</h3>
            <p className="mt-3 text-sm text-foreground-muted">
              Access our US-based technicians for lifetime build diagnostics, performance tuning, and upgrade planning. Real humans, real fixes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-foreground-muted">
              <span className="rounded-full bg-background-muted px-3 py-1">Live chat</span>
              <span className="rounded-full bg-background-muted px-3 py-1">Proactive monitoring</span>
              <span className="rounded-full bg-background-muted px-3 py-1">Upgrade consulting</span>
            </div>
            <Button href="/support" variant="ghost" className="mt-6">Open support knowledge base</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

