import Link from "next/link";

export function BrandLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-[var(--shadow-soft)]">
        EZ
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-tight">
          <span>EZComputers</span>
          <span className="text-xs font-normal text-foreground-muted">
            Power. Precision. Ready.</span>
        </span>
      )}
    </Link>
  );
}

