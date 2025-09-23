import { Mail, MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { HoverPrefetchLink } from "@/components/navigation/prefetch-link";

const quickLinks = [
  { label: "Pre-Built PCs", href: "/prebuilt" },
  { label: "Custom Builder", href: "/custom-builder" },
  { label: "About Us", href: "/about" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Warranty", href: "/support#warranty" },
];

const officeDetails = [
  {
    icon: MapPin,
    label: "Headquarters",
    value: "1125 Aurora Ave, Suite 400, Seattle, WA 98101",
  },
  {
    icon: Phone,
    label: "Sales & Support",
    value: "(800) 555-3821",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@ezcomputers.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon-Sat, 9am - 7pm PT",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-background">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Elevate your setup</h3>
              <p className="mt-2 max-w-lg text-sm text-foreground-muted">
                EZComputers blends premium hardware, meticulous craftsmanship, and proactive support so you can focus on what matters: gaming, creating, and scaling ideas.
              </p>
            </div>
            <form className="space-y-3" action="/api/newsletter" method="post">
              <input type="hidden" name="source" value="footer" />
              <input type="text" name="guard" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden />
              <label className="text-sm font-medium text-foreground" htmlFor="newsletter-email">
                Stay ahead of new drops & exclusive bundles
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 flex-1 rounded-[var(--radius-md)] border border-border-soft bg-background-muted px-4 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                />
                <button
                  type="submit"
                  className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-500 px-5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  Subscribe
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="text-xs text-foreground-muted">
                We respect your inbox. Unsubscribe anytime. By subscribing you agree to our privacy policy.
              </p>
            </form>
          </div>
          <div className="grid gap-6">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-3 text-sm">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <HoverPrefetchLink
                      href={link.href}
                      className="text-foreground-muted transition hover:text-brand-500"
                    >
                      {link.label}
                    </HoverPrefetchLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                Legal
              </h4>
              <ul className="mt-3 space-y-3 text-sm">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <HoverPrefetchLink
                      href={link.href}
                      className="text-foreground-muted transition hover:text-brand-500"
                    >
                      {link.label}
                    </HoverPrefetchLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-5 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-[var(--shadow-soft)]">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              {officeDetails.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex gap-3">
                  <Icon className="mt-0.5 h-4 w-4 text-brand-500" aria-hidden />
                  <div>
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-foreground-muted">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-soft pt-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p> (c) {new Date().getFullYear()} EZComputers. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com" className="transition hover:text-brand-500">
              Instagram
            </Link>
            <Link href="https://www.youtube.com" className="transition hover:text-brand-500">
              YouTube
            </Link>
            <Link href="https://www.twitter.com" className="transition hover:text-brand-500">
              X / Twitter
            </Link>
            <Link href="https://www.linkedin.com" className="transition hover:text-brand-500">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

