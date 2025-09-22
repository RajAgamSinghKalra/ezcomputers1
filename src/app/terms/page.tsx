import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Review the conditions that govern EZComputers product sales, warranties, and support engagements.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Terms of Service</h1>
      <p className="text-sm text-foreground-muted">
        These terms outline how EZComputers provides products and support services. A full policy document will be published before launch.
      </p>
    </div>
  );
}

