import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="container space-y-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Welcome back, {session.user.name ?? session.user.email}</h1>
        <p className="text-sm text-foreground-muted">Manage saved builds, view order history, and update your preferences.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
        >
          <h2 className="text-lg font-semibold text-foreground">Order history</h2>
          <p className="text-sm text-foreground-muted">Track past purchases and download invoices.</p>
        </Link>
        <Link
          href="/custom-builder"
          className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
        >
          <h2 className="text-lg font-semibold text-foreground">Saved builds</h2>
          <p className="text-sm text-foreground-muted">Return to the builder to refine your configurations.</p>
        </Link>
        <Link
          href="/account/security"
          className="rounded-[var(--radius-lg)] border border-border-soft bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
        >
          <h2 className="text-lg font-semibold text-foreground">Security settings</h2>
          <p className="text-sm text-foreground-muted">Manage two-factor authentication and backup codes.</p>
        </Link>
      </div>
    </div>
  );
}

