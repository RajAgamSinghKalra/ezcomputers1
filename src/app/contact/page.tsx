import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Connect with EZComputers for sales consultations, enterprise deployments, or support escalations. Our specialists respond within one business day.",
};

const contactInfo = [
  {
    icon: Phone,
    label: "Sales & Support",
    value: "(800) 555-3821",
    note: "Mon-Sat, 9am - 7pm PT",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@ezcomputers.com",
    note: "We respond within one business day",
  },
  {
    icon: MessageCircle,
    label: "Live chat",
    value: "Available in the bottom-right corner",
    note: "Average response under 2 minutes",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "1125 Aurora Ave, Seattle, WA 98101",
    note: "Appointment-only showroom",
  },
  {
    icon: Clock,
    label: "Production lab",
    value: "Build queue active 7 days a week",
    note: "Rush orders available on request",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      <section className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <Badge variant="outline">Connect with us</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">We build partnerships, not just PCs.</h1>
            <p className="mt-3 text-sm text-foreground-muted">
              Reach out for guided purchasing, enterprise rollouts, creative studio deployments, or dedicated support plans. Our senior advisors tailor every engagement to your workload and timeline.
            </p>
            <div className="mt-8 space-y-5">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex gap-4 rounded-[var(--radius-md)] border border-border-soft bg-background px-4 py-3">
                  <item.icon className="mt-1 h-5 w-5 text-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-foreground">{item.value}</p>
                    <p className="text-xs text-foreground-muted">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[var(--radius-md)] border border-brand-500/30 bg-brand-500/5 p-4 text-xs text-brand-600">
              Need immediate help with an existing system? Call the hotline or reference your build number in live chat for priority support.
            </div>
          </aside>

          <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-semibold text-foreground">Send us a message</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              Tell us about your project, deployment goals, or questions. We&apos;ll route your request to the best specialist.
            </p>
            <ContactForm className="mt-6" />
          </div>
        </div>
      </section>
    </div>
  );
}

