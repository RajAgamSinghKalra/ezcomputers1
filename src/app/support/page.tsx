import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Support & FAQ",
  description:
    "Access EZComputers support resources, warranty details, troubleshooting guides, and frequently asked questions.",
};

const faqs = [
  {
    question: "What is included in the 48-hour validation pipeline?",
    answer:
      "We run multi-stage burn-in using OCCT, AIDA64, and proprietary GPU trace workloads. This validates power delivery, thermals, and memory stability under sustained load.",
  },
  {
    question: "How fast can you fulfill rush orders?",
    answer:
      "Our rush program can ship select configurations within 72 hours. Contact us with your required spec and we will confirm availability and express options.",
  },
  {
    question: "Do you offer on-site support?",
    answer:
      "Yes. Enterprise and studio clients receive dedicated escalation paths and optional on-site visits for deployments, repairs, or upgrade cycles.",
  },
  {
    question: "Can I upgrade components later?",
    answer:
      "Absolutely. We source upgrade-ready platforms, provide custom wiring, and offer upgrade playbooks tailored to your build ID.",
  },
];

const resources = [
  {
    title: "Warranty & coverage",
    body: "3-year standard warranty with options to extend to 5 years. Includes cross-shipping of parts and labor.",
    href: "#warranty",
  },
  {
    title: "Driver & firmware library",
    body: "Access curated driver stacks, BIOS profiles, and tuning presets maintained by our engineers.",
    href: "#drivers",
  },
  {
    title: "Status dashboard",
    body: "Check build queue progress, RMA status, and upcoming maintenance windows.",
    href: "#status",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-background">
      <section className="container py-16">
        <div className="space-y-6">
          <Badge variant="outline">Support hub</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            We&apos;re here for the lifetime of your system.
          </h1>
          <p className="max-w-2xl text-base text-foreground-muted">
            From proactive firmware updates to midnight troubleshooting, our Seattle-based support team is available 24/7 for customers and enterprise partners alike.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="mailto:support@ezcomputers.com">Email support</Button>
            <Button asChild variant="secondary">
              <a href="/contact">Open a consultation</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background-muted py-16">
        <div className="container grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 text-sm text-foreground-muted shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
            >
              <h2 className="text-lg font-semibold text-foreground">{resource.title}</h2>
              <p className="mt-2">{resource.body}</p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold text-brand-500">View details &rarr;</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div id="warranty" className="space-y-4 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Warranty & coverage</h2>
            <ul className="space-y-3 text-sm text-foreground-muted">
              <li>- 3-year standard warranty covering parts, labor, and round-trip shipping.</li>
              <li>- Optional 5-year platinum coverage with on-site service and part cross-shipping.</li>
              <li>- Lifetime technical support with configuration backups and tuning profiles.</li>
            </ul>
          </div>
          <div id="drivers" className="space-y-4 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Driver & firmware library</h2>
            <p className="text-sm text-foreground-muted">
              Each system ships with a build ID that grants access to curated driver stacks, BIOS profiles, and performance tuning presets. Updates are verified in-house before we publish them.
            </p>
            <Button asChild variant="outline">
              <a href="#">Access library (login required)</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background-muted py-16">
        <div className="container space-y-6">
          <h2 className="section-title">Frequently asked questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-5 shadow-sm">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-foreground-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

