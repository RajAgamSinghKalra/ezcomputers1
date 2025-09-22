"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComponentKind } from "@prisma/client";
import { formatCurrencyFromCents } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { CART_SUMMARY_QUERY_KEY } from "@/components/cart/cart-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentOptionWithMeta } from "@/lib/data/components";

const builderSteps: Array<{
  kind: ComponentKind;
  label: string;
  description: string;
  optional?: boolean;
}> = [
  { kind: ComponentKind.CPU, label: "Processor", description: "Pick the brains of your system." },
  { kind: ComponentKind.MOTHERBOARD, label: "Motherboard", description: "Define chipset, connectivity, and future expansion." },
  { kind: ComponentKind.GPU, label: "Graphics", description: "Drive frames, renders, and AI workloads." },
  { kind: ComponentKind.MEMORY, label: "Memory", description: "Balance capacity and speed for your software." },
  { kind: ComponentKind.STORAGE, label: "Primary storage", description: "Choose your OS and project drive." },
  { kind: ComponentKind.POWER_SUPPLY, label: "Power supply", description: "Ensure stable, efficient power delivery." },
  { kind: ComponentKind.COOLING, label: "Cooling", description: "Keep thermals in check during heavy loads." },
  { kind: ComponentKind.CASE, label: "Chassis", description: "Select the enclosure that fits your style and airflow needs." },
  { kind: ComponentKind.OS, label: "Operating system", description: "Pre-install Windows or bring your own license.", optional: true },
  { kind: ComponentKind.SERVICE, label: "Services", description: "Add premium assembly, monitoring, or extended coverage.", optional: true },
];

type CompatibilityData = {
  socket?: string;
  sockets?: string[];
  chipset?: string[];
  memory?: string | string[];
  formFactor?: string | string[];
  maxRadiatorMm?: number;
  maxGpuLengthMm?: number;
  recommendedPsu?: number;
  wattage?: number;
  radiatorSizeMm?: number;
  lengthMm?: number;
};

export type BuilderComponent = ComponentOptionWithMeta & {
  parsedCompatibility: CompatibilityData;
};

export function CustomBuilder({ initialComponents, initialSelection }: { initialComponents: ComponentOptionWithMeta[]; initialSelection?: Partial<Record<ComponentKind, string>> }) {
  const components = useMemo<BuilderComponent[]>(
    () =>
      initialComponents.map((component) => ({
        ...component,
        parsedCompatibility: parseCompatibility(component.compatibility),
      })),
    [initialComponents],
  );

  const prefilledSelection = useMemo(() => {
    if (!initialSelection) return null;
    const map = new Map<ComponentKind, BuilderComponent>();
    Object.entries(initialSelection).forEach(([kind, componentId]) => {
      if (!componentId) return;
      const matched = components.find((component) => component.id === componentId);
      if (matched) {
        map.set(kind as ComponentKind, matched);
      }
    });
    return map.size ? map : null;
  }, [components, initialSelection]);

  const componentsByKind = useMemo(() => {
    const map = new Map<ComponentKind, BuilderComponent[]>();
    components.forEach((component) => {
      const list = map.get(component.kind) ?? [];
      list.push(component);
      map.set(component.kind, list);
    });
    return map;
  }, [components]);

  const [selected, setSelected] = useState<Record<ComponentKind, BuilderComponent | null>>(() => {
    const initial = Object.fromEntries(
      Object.values(ComponentKind).map((kind) => [kind, null]),
    ) as Record<ComponentKind, BuilderComponent | null>;
    return initial;
  });

  useEffect(() => {
    if (!prefilledSelection) return;
    setSelected((previous) => {
      let changed = false;
      const next = { ...previous };
      prefilledSelection.forEach((component, kind) => {
        if (component && next[kind]?.id !== component.id) {
          next[kind] = component;
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [prefilledSelection]);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "adding" | "added" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const filteredOptions = useMemo(() => {
    const map = new Map<ComponentKind, BuilderComponent[]>();
    builderSteps.forEach((step) => {
      const options = componentsByKind.get(step.kind) ?? [];
      map.set(step.kind, options.filter((option) => isCompatible(option, selected)));
    });
    return map;
  }, [componentsByKind, selected]);

  const subtotalCents = useMemo(() => {
    return Object.values(selected).reduce((total, component) => {
      if (!component) return total;
      return total + component.priceCents;
    }, 0);
  }, [selected]);

  const estimatedWattage = useMemo(() => {
    return Object.values(selected).reduce((total, component) => {
      if (!component) return total;
      const wattage = component.parsedCompatibility.wattage;
      return total + (wattage ?? 0);
    }, 150); // base overhead for fans, storage, etc.
  }, [selected]);

  const minimumPsu = useMemo(() => {
    const recommended = Object.values(selected).reduce((max, component) => {
      if (!component) return max;
      return Math.max(max, component.parsedCompatibility.recommendedPsu ?? 0);
    }, 0);
    return Math.max(Math.ceil(estimatedWattage * 1.25), recommended);
  }, [estimatedWattage, selected]);

  const handleSelect = (kind: ComponentKind, component: BuilderComponent) => {
    setSelected((prev) => ({ ...prev, [kind]: component }));
  };

  const handleClear = (kind: ComponentKind) => {
    setSelected((prev) => ({ ...prev, [kind]: null }));
  };

  const handleSaveConfiguration = () => {
    if (!isBuildComplete()) {
      setStatus("error");
      return;
    }

    setStatus("saving");
    startTransition(async () => {
      try {
        const response = await fetch("/api/custom-builder/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serializeBuild(selected, subtotalCents, estimatedWattage, minimumPsu)),
        });
        if (!response.ok) {
          throw new Error("Failed to save build");
        }
        setStatus("saved");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    });
  };

  const handleAddToCart = () => {
    if (!isBuildComplete()) {
      setStatus("error");
      return;
    }
    setStatus("adding");
    startTransition(async () => {
      try {
        const response = await fetch("/api/custom-builder/add-to-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serializeBuild(selected, subtotalCents, estimatedWattage, minimumPsu)),
        });
        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }
        queryClient.invalidateQueries({ queryKey: CART_SUMMARY_QUERY_KEY });
        setStatus("added");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    });
  };

  const isBuildComplete = () => {
    return builderSteps.every((step) => step.optional || selected[step.kind]);
  };

  return (
    <div className="space-y-8">
      <SummaryPanel
        selected={selected}
        subtotalCents={subtotalCents}
        estimatedWattage={estimatedWattage}
        minimumPsu={minimumPsu}
        status={status}
        onSave={handleSaveConfiguration}
        onAddToCart={handleAddToCart}
        isPending={isPending}
      />

      <div className="grid gap-8">
        {builderSteps.map((step) => {
          const options = filteredOptions.get(step.kind) ?? [];
          const selection = selected[step.kind];
          return (
            <section key={step.kind} className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-sm">
              <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{step.label}</h2>
                  <p className="text-xs text-foreground-muted">{step.description}</p>
                </div>
                {selection && (
                  <Button variant="ghost" size="sm" onClick={() => handleClear(step.kind)}>
                    Clear selection
                  </Button>
                )}
              </header>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {options.map((option) => {
                  const isSelected = selection?.id === option.id;
                  return (
                    <article
                      key={option.id}
                      className={cn(
                        "group flex h-full flex-col justify-between rounded-[var(--radius-md)] border border-border-soft bg-background p-4 text-sm shadow-sm transition hover:border-brand-400 hover:shadow-[var(--shadow-soft)]",
                        isSelected && "border-brand-500/50 bg-brand-500/5",
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wide text-foreground-muted">{option.brand}</span>
                          {option.isRecommended && <Badge variant="outline">Recommended</Badge>}
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{option.name}</h3>
                        <p className="text-xs text-foreground-muted line-clamp-3">{option.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{formatCurrencyFromCents(option.priceCents)}</span>
                        <Button
                          variant={isSelected ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => handleSelect(step.kind, option)}
                          disabled={isPending}
                        >
                          {isSelected ? "Selected" : "Choose"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
                {options.length === 0 && (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-border-soft p-6 text-sm text-foreground-muted">
                    No compatible options available. Adjust earlier selections to unlock more choices.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function parseCompatibility(raw: string | null): CompatibilityData {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as CompatibilityData;
    return parsed;
  } catch (error) {
    console.warn("Failed to parse compatibility", raw, error);
    return {};
  }
}

function isCompatible(option: BuilderComponent, selected: Record<ComponentKind, BuilderComponent | null>) {
  switch (option.kind) {
    case ComponentKind.CPU: {
      const motherboard = selected[ComponentKind.MOTHERBOARD];
      if (!motherboard) return true;
      const cpuSocket = option.parsedCompatibility.socket;
      const boardSocket = motherboard.parsedCompatibility.socket;
      return !cpuSocket || !boardSocket || cpuSocket === boardSocket;
    }
    case ComponentKind.MOTHERBOARD: {
      const cpu = selected[ComponentKind.CPU];
      if (cpu) {
        const socket = option.parsedCompatibility.socket;
        const cpuSocket = cpu.parsedCompatibility.socket;
        if (socket && cpuSocket && socket !== cpuSocket) return false;
      }
      const caseSelection = selected[ComponentKind.CASE];
      if (caseSelection) {
        const boardForm = normalize(option.parsedCompatibility.formFactor);
        const caseForms = normalize(caseSelection.parsedCompatibility.formFactor);
        if (boardForm.length && caseForms.length && !caseForms.some((form) => boardForm.includes(form))) {
          return false;
        }
      }
      return true;
    }
    case ComponentKind.MEMORY: {
      const board = selected[ComponentKind.MOTHERBOARD];
      if (!board) return true;
      const boardMemory = normalize(board.parsedCompatibility.memory);
      const memoryType = normalize(option.parsedCompatibility.memory);
      if (boardMemory.length && memoryType.length) {
        return boardMemory.some((type) => memoryType.includes(type));
      }
      return true;
    }
    case ComponentKind.COOLING: {
      const cpu = selected[ComponentKind.CPU];
      if (!cpu) return true;
      const sockets = new Set(normalize(option.parsedCompatibility.sockets).concat(option.parsedCompatibility.socket ?? []));
      if (sockets.size === 0) return true;
      const cpuSocket = cpu.parsedCompatibility.socket;
      return !cpuSocket || sockets.has(cpuSocket);
    }
    case ComponentKind.CASE: {
      const board = selected[ComponentKind.MOTHERBOARD];
      if (board) {
        const caseForms = normalize(option.parsedCompatibility.formFactor);
        const boardForm = normalize(board.parsedCompatibility.formFactor);
        if (caseForms.length && boardForm.length && !caseForms.some((form) => boardForm.includes(form))) {
          return false;
        }
      }
      const gpu = selected[ComponentKind.GPU];
      if (gpu && option.parsedCompatibility.maxGpuLengthMm) {
        const length = gpu.parsedCompatibility.lengthMm ?? option.parsedCompatibility.maxGpuLengthMm;
        if (length > option.parsedCompatibility.maxGpuLengthMm) return false;
      }
      const cooler = selected[ComponentKind.COOLING];
      if (cooler && option.parsedCompatibility.maxRadiatorMm && cooler.parsedCompatibility.radiatorSizeMm) {
        if (cooler.parsedCompatibility.radiatorSizeMm > option.parsedCompatibility.maxRadiatorMm) {
          return false;
        }
      }
      return true;
    }
    case ComponentKind.POWER_SUPPLY: {
      const required = Object.values(selected).reduce((max, component) => {
        if (!component) return max;
        return Math.max(max, component.parsedCompatibility.recommendedPsu ?? 0);
      }, 0);
      const estimated = Object.values(selected).reduce((total, component) => total + (component?.parsedCompatibility.wattage ?? 0), 150);
      const min = Math.max(Math.ceil(estimated * 1.25), required);
      const psuCapacity = option.parsedCompatibility.wattage ?? option.priceCents; // fallback ensures we return something
      return !psuCapacity || psuCapacity >= min;
    }
    case ComponentKind.GPU: {
      const caseSelection = selected[ComponentKind.CASE];
      if (caseSelection && caseSelection.parsedCompatibility.maxGpuLengthMm && option.parsedCompatibility.lengthMm) {
        if (option.parsedCompatibility.lengthMm > caseSelection.parsedCompatibility.maxGpuLengthMm) {
          return false;
        }
      }
      return true;
    }
    default:
      return true;
  }
}

function normalize(value?: string | string[]) {
  if (!value) return [] as string[];
  if (Array.isArray(value)) return value.map((item) => item.toString());
  return [value.toString()];
}

function serializeBuild(
  selected: Record<ComponentKind, BuilderComponent | null>,
  subtotalCents: number,
  estimatedWattage: number,
  minimumPsu: number,
) {
  const components = Object.entries(selected)
    .filter(([, component]) => component)
    .map(([kind, component]) => ({
      kind,
      componentId: component!.id,
      priceCents: component!.priceCents,
    }));

  return {
    subtotalCents,
    estimatedWattage,
    minimumPsu,
    components,
  };
}

function SummaryPanel({
  selected,
  subtotalCents,
  estimatedWattage,
  minimumPsu,
  status,
  onSave,
  onAddToCart,
  isPending
}: {
  selected: Record<ComponentKind, BuilderComponent | null>;
  subtotalCents: number;
  estimatedWattage: number;
  minimumPsu: number;
  status: "idle" | "saving" | "saved" | "adding" | "added" | "error";
  onSave: () => void;
  onAddToCart: () => void;
  isPending: boolean;
}) {
  const completedCount = builderSteps.filter((step) => selected[step.kind]).length;
  const totalSteps = builderSteps.filter((step) => !step.optional).length;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-6 shadow-[var(--shadow-soft)]">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Build progress
          </span>
          <div className="flex items-center gap-3">
            <div className="flex-1 overflow-hidden rounded-full bg-background-muted">
              <div
                className="h-2 rounded-full bg-brand-500 transition-all"
                style={{ width: `${(completedCount / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-xs text-foreground-muted">
              {completedCount}/{totalSteps} core selections
            </span>
          </div>
          <div className="grid gap-2 text-sm text-foreground">
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Current total</span>
              <span className="text-lg font-semibold">{formatCurrencyFromCents(subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <span>Estimated system wattage</span>
              <span>{estimatedWattage} W</span>
            </div>
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <span>Minimum PSU recommendation</span>
              <span>{minimumPsu} W</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={onAddToCart} disabled={isPending}>
            {status === "adding" ? "Adding..." : status === "added" ? "Added to cart" : "Add to cart"}
          </Button>
          <Button className="w-full" size="lg" variant="secondary" onClick={onSave} disabled={isPending}>
            {status === "saving" ? "Saving..." : status === "saved" ? "Build saved" : "Save configuration"}
          </Button>
          {status === "error" && (
            <p className="text-xs text-red-500" role="status">
              Complete required selections before saving or adding to cart.
            </p>
          )}
          {status === "saved" && (
            <p className="text-xs text-emerald-500" role="status">
              Build saved to your account. You can revisit it anytime.
            </p>
          )}
          {status === "added" && (
            <p className="text-xs text-emerald-500" role="status">
              Custom build added to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}







