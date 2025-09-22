import { ComponentKind, ProductCategory } from "@prisma/client";

export type CompareProductSnapshot = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  priceCents: number;
  heroImage: string | null;
  headline?: string | null;
  specs: Record<string, string>;
};

const SPEC_LABELS = ["CPU", "GPU", "Memory", "Storage", "Form Factor", "Cooling"] as const;

export type ProductForComparison = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  basePriceCents: number;
  heroImage?: string | null;
  headline?: string | null;
  components: Array<{
    kind: ComponentKind;
    label: string;
    component: { name: string };
  }>;
  specifications: Array<{ label: string; value: string }>;
};

export function toCompareSnapshot(product: ProductForComparison): CompareProductSnapshot {
  const specMap = new Map<string, string>();

  for (const component of product.components) {
    switch (component.kind) {
      case ComponentKind.CPU:
        specMap.set("CPU", component.component.name);
        break;
      case ComponentKind.GPU:
        specMap.set("GPU", component.component.name);
        break;
      case ComponentKind.MEMORY:
        specMap.set("Memory", component.component.name);
        break;
      case ComponentKind.STORAGE:
        if (!specMap.has("Storage")) {
          specMap.set("Storage", component.component.name);
        }
        break;
      case ComponentKind.CASE:
        specMap.set("Form Factor", component.label);
        break;
      case ComponentKind.COOLING:
        specMap.set("Cooling", component.component.name);
        break;
      default:
        break;
    }
  }

  for (const spec of product.specifications) {
    const normalized = spec.label.toLowerCase();
    if (normalized.includes("cpu") && !specMap.has("CPU")) {
      specMap.set("CPU", spec.value);
    } else if (normalized.includes("gpu") && !specMap.has("GPU")) {
      specMap.set("GPU", spec.value);
    } else if (normalized.includes("memory") && !specMap.has("Memory")) {
      specMap.set("Memory", spec.value);
    } else if (normalized.includes("storage") && !specMap.has("Storage")) {
      specMap.set("Storage", spec.value);
    } else if (normalized.includes("form") && !specMap.has("Form Factor")) {
      specMap.set("Form Factor", spec.value);
    } else if (normalized.includes("cooling") && !specMap.has("Cooling")) {
      specMap.set("Cooling", spec.value);
    }
  }

  const specs: Record<string, string> = {};
  SPEC_LABELS.forEach((label) => {
    const value = specMap.get(label);
    if (value) {
      specs[label] = value;
    }
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    priceCents: product.basePriceCents,
    heroImage: product.heroImage ?? null,
    headline: product.headline ?? null,
    specs,
  };
}
