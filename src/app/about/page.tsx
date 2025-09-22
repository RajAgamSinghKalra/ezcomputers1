import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About EZComputers",
  description:
    "Learn how EZComputers crafts elite pre-built PCs and custom rigs with obsessive attention to thermals, acoustics, and user experience.",
};

const values = [
  {
    title: "Craftsmanship first",
    body: "Every build is assembled by a senior technician using torque-calibrated tools, custom sleeving, and meticulous cable routing.",
  },
  {
    title: "Performance without compromise",
    body: "We bin components, tune firmware, and profile thermals so you receive the absolute best iteration of each part.",
  },
  {
    title: "Lifelong partnership",
    body: "From proactive firmware updates to upgrade consulting, our team stays hands-on for the lifecycle of your system.",
  },
];

const milestones = [
  {
    year: "2014",
    headline: "EZComputers is founded",
    detail: "Two competitive gamers and an aerospace engineer set up shop in a small Tacoma garage to build tournament PCs.",
  },
  {
    year: "2017",
    headline: "Launch of signature thermal pipeline",
    detail: "Our proprietary airflow modeling and burn-in regimen reduce peak temps by an average of 18 deg C versus OEM systems.",
  },
  {
    year: "2020",
    headline: "Enterprise & studio division",
    detail: "We expanded with a dedicated integration team supporting VFX studios, architecture firms, and AI startups.",
  },
  {
    year: "2024",
    headline: "Builder 3.0 rolls out",
    detail: "Our intelligent custom builder introduced live compatibility intelligence and wattage analytics for end-users.",
  },
];

const leadership = [
  {
    name: "Emery Zhang",
    role: "Co-founder & CEO",
    bio: "Former aerospace engineer bringing mission-critical systems rigor to every PC we ship.",
  },
  {
    name: "Jordan Reyes",
    role: "Head of Production",
    bio: "Leads our 40-person lab focused on thermal optimization, QA automation, and technician training.",
  },
  {
    name: "Sasha Coleman",
    role: "Director of Client Experience",
    bio: "Oversees concierge onboarding, lifetime support initiatives, and enterprise partnerships.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline">Our story</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Building exceptional machines with aerospace precision and gamer obsession.
            </h1>
            <p className="text-base text-foreground-muted">
              EZComputers was born from tournaments, render farms, and engineering labs. We were tired of systems that looked the part but throttled under load, so we built a company that treats thermals, acoustics, and longevity as first-class features.
            </p>
            <p className="text-base text-foreground-muted">
              Today, our Seattle headquarters houses a state-of-the-art production lab, acoustic chamber, and R&D suite. From esports arenas to AAA studios and AI research teams, thousands rely on us to deliver performance without compromise.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-semibold text-foreground">By the numbers</h2>
            <dl className="mt-6 grid gap-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted">Average QA failures per 100 builds</dt>
                <dd className="text-2xl font-semibold text-foreground">0.7</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted">Customer satisfaction score</dt>
                <dd className="text-2xl font-semibold text-foreground">98.4%</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted">Technicians with 5+ years tenure</dt>
                <dd className="text-2xl font-semibold text-foreground">32</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-background-muted py-16">
        <div className="container space-y-10">
          <h2 className="section-title">What drives us</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="section-title">Milestones that shaped EZComputers</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{milestone.year}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{milestone.headline}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{milestone.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background-muted py-16">
        <div className="container space-y-6">
          <h2 className="section-title">Leadership team</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {leadership.map((leader) => (
              <div key={leader.name} className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 text-sm text-foreground-muted shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{leader.name}</h3>
                <p className="text-xs uppercase tracking-wide text-brand-500">{leader.role}</p>
                <p className="mt-3">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

