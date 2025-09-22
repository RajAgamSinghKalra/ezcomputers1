"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, UserRound } from "lucide-react";
import { navItems } from "./site-nav-links";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CartIndicator } from "@/components/cart/cart-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <BrandLogo />
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              if (item.items?.length) {
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-brand-50 text-brand-600"
                          : "text-foreground-muted hover:bg-background-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                    <div className="invisible absolute left-0 top-full mt-3 w-72 rounded-[var(--radius-lg)] border border-border-soft bg-background-elevated p-4 opacity-0 shadow-[var(--shadow-soft)] transition group-hover:visible group-hover:opacity-100">
                      <div className="flex flex-col gap-3">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="rounded-lg p-3 transition hover:bg-background-muted"
                          >
                            <p className="text-sm font-semibold text-foreground">{sub.label}</p>
                            {sub.description && (
                              <p className="text-xs text-foreground-muted">{sub.description}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-50 text-brand-600"
                      : "text-foreground-muted hover:bg-background-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="md" className="px-4" href="/account">
              <UserRound className="mr-2 h-4 w-4" aria-hidden />
              Account
            </Button>
            <Button variant="secondary" size="md" className="px-4" href="/cart">
              <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
              Cart
              <CartIndicator />
            </Button>
          </nav>
          <ThemeToggle />
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}

