"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
};

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-[var(--button-primary-foreground)] shadow-[var(--shadow-soft)] hover:bg-brand-400 focus-visible:outline-brand-500",
  secondary:
    "bg-background-muted text-foreground hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-brand-500",
  ghost:
    "bg-transparent text-foreground hover:bg-background-muted focus-visible:outline-brand-500",
  outline:
    "border border-border-strong text-foreground hover:border-brand-400 hover:text-brand-500 focus-visible:outline-brand-500",
  destructive:
    "bg-red-600 text-white shadow-[var(--shadow-soft)] hover:bg-red-500 focus-visible:outline-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm font-medium",
  lg: "h-12 px-6 text-base font-semibold",
  icon: "h-10 w-10",
};

function makeClassName(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  forwardedRef,
) {
  const classes = makeClassName(variant, size, className);

  if ("href" in rest && typeof rest.href === "string") {
    const { href, prefetch, target, rel, ...linkProps } = rest;
    const isInternal = href.startsWith("/") && !href.startsWith("//");

    if (isInternal) {
      return (
        <Link
          data-ezc-button="true"
          ref={forwardedRef as React.Ref<HTMLAnchorElement>}
          href={href}
          prefetch={prefetch}
          className={classes}
          {...linkProps}
        >
          {children}
        </Link>
      );
    }

    const isHttpLink = href.startsWith("http://") || href.startsWith("https://");
    const resolvedTarget = target ?? (isHttpLink ? "_blank" : undefined);
    const resolvedRel = rel ?? (isHttpLink ? "noopener noreferrer" : undefined);

    return (
      <a
        data-ezc-button="true"
        ref={forwardedRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target={resolvedTarget}
        rel={resolvedRel}
        className={classes}
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      data-ezc-button="true"
      ref={forwardedRef as React.Ref<HTMLButtonElement>}
      type={buttonProps.type ?? "button"}
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  );
});




