import type { Metadata } from "next";
import { ComponentKind } from "@prisma/client";
import { getProductBySlug } from "@/lib/data/products";
import { getComponentOptions } from "@/lib/data/components";
import { CustomBuilder } from "@/components/custom-builder/custom-builder";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Custom PC Builder",
  description:
    "Design a bespoke EZComputers system with live compatibility safeguards, price tracking, and expert-recommended configurations.",
};

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function CustomBuilderPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const baseSlug = params.base;
  const buildSlug = params.build;

  const components = await getComponentOptions();
  const serialized = components.map((component) => ({
    ...component,
    compatibility: component.compatibility ?? null,
    specs: component.specs ?? null,
  }));

  let initialSelection: Partial<Record<ComponentKind, string>> | undefined;

  if (buildSlug) {
    const savedBuild = await prisma.customBuild.findUnique({
      where: { slug: buildSlug },
      include: {
        components: true,
      },
    });

    if (savedBuild) {
      const map: Partial<Record<ComponentKind, string>> = {};
      savedBuild.components.forEach((component) => {
        if (!map[component.kind]) {
          map[component.kind] = component.componentId;
        }
      });
      initialSelection = map;
    }
  } else if (baseSlug) {
    const baseProduct = await getProductBySlug(baseSlug);
    if (baseProduct) {
      const map: Partial<Record<ComponentKind, string>> = {};
      baseProduct.components.forEach((component) => {
        if (!map[component.kind]) {
          map[component.kind] = component.componentId;
        }
      });
      initialSelection = map;
    }
  }

  return (
    <div className="bg-background">
      <section className="container space-y-10 py-16">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Craft your dream system</h1>
          <p className="mx-auto max-w-2xl text-sm text-foreground-muted">
            Choose each component with confidence. Our compatibility intelligence adapts recommendations as you build, ensuring every selection works in harmony.
          </p>
        </header>
        <CustomBuilder initialComponents={serialized} initialSelection={initialSelection} />
      </section>
    </div>
  );
}
