import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TwoFactorManager } from "@/components/account/two-factor-manager";

export const metadata = {
  title: "Security Settings",
};

export default async function SecuritySettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  return (
    <div className="container space-y-8 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Account security</h1>
        <p className="text-sm text-foreground-muted">
          Harden your account with two-factor authentication and backup recovery codes.
        </p>
      </div>
      <TwoFactorManager enabled={Boolean(user?.twoFactorEnabled)} />
    </div>
  );
}
