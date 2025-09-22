import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "success" | "warning";
}) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide";
  const variants: Record<typeof variant, string> = {
    default: "bg-brand-500/10 text-brand-600",
    outline: "border border-brand-500/40 text-brand-600",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
  } as const;

  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}

