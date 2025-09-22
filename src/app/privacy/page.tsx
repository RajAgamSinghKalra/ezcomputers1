import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Understand how EZComputers collects, uses, and safeguards customer data across our ecommerce and support experiences.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="text-sm text-foreground-muted">
        EZComputers respects your privacy. We collect only the data required to process orders, improve our services, and provide meaningful support. Full policy documentation is forthcoming.
      </p>
    </div>
  );
}

