"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NavItem } from "./site-nav-links";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="md"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="gap-2 rounded-full border border-border-soft px-4 text-sm hover:bg-background-muted"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        <span>{open ? "Close menu" : "Open menu"}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md">
          <div className="container flex flex-col gap-6 py-8">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Navigation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="gap-2 rounded-full border border-border-soft px-3 text-xs text-foreground-muted hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
                <span>Close</span>
              </Button>
            </div>
            <nav className="flex flex-col gap-4 text-lg">
              {items.map((item) => (
                <div key={item.href} className="flex flex-col gap-2">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-semibold text-foreground transition hover:text-brand-500"
                  >
                    {item.label}
                  </Link>
                  {item.description && (
                    <p className="text-sm text-foreground-muted">{item.description}</p>
                  )}
                  {item.items && (
                    <div className="ml-4 flex flex-col gap-2 text-base">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpen(false)}
                          className="text-foreground-muted transition hover:text-brand-500"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

