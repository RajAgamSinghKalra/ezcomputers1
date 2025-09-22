import { ComponentKind, type ComponentOption } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ComponentOptionWithMeta = ComponentOption;

export async function getComponentOptions() {
  return prisma.componentOption.findMany({
    orderBy: [
      { isRecommended: "desc" },
      { priceCents: "asc" },
    ],
  });
}

export function groupComponentsByKind(components: ComponentOptionWithMeta[]) {
  const grouped = new Map<ComponentKind, ComponentOptionWithMeta[]>();
  components.forEach((component) => {
    const existing = grouped.get(component.kind) ?? [];
    existing.push(component);
    grouped.set(component.kind, existing);
  });
  return grouped;
}
