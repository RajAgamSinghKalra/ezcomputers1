import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SavedBuildsList } from "@/components/account/saved-builds";

export const metadata = {
  title: "Saved Builds",
};

export default async function SavedBuildsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const builds = await prisma.customBuild.findMany({
    where: { userId: session.user.id },
    include: {
      components: {
        include: { component: true },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = builds.map((build) => ({
    id: build.id,
    name: build.name,
    slug: build.slug,
    summary: build.summary,
    estimatedWattage: build.estimatedWattage,
    totalPriceCents: build.totalPriceCents || build.basePriceCents,
    updatedAt: build.updatedAt.toISOString(),
    components: build.components.map((component) => ({
      kind: component.kind,
      name: component.component.name,
      brand: component.component.brand,
    })),
  }));

  return (
    <div className="container space-y-8 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Saved custom builds</h1>
        <p className="text-sm text-foreground-muted">
          Launch builds back into the configurator, share them with teammates, or add them directly to your cart.
        </p>
      </div>
      <SavedBuildsList builds={serialized} />
    </div>
  );
}
