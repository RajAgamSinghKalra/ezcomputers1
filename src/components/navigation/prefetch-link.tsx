"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  startTransition,
  useCallback,
  useMemo,
  useRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from "react";

type PrefetchLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "onMouseEnter"> & {
    onMouseEnter?: (event: MouseEvent<HTMLAnchorElement>) => void;
  };

function formatHref(href: LinkProps["href"]): string | null {
  if (typeof href === "string") {
    return href;
  }

  const { pathname, query, hash } = href;
  if (!pathname) {
    return null;
  }

  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          params.append(key, String(entry));
        });
        return;
      }

      params.append(key, String(value));
    });
  }

  const queryString = params.toString();
  const normalizedHash = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";

  return `${pathname}${queryString ? `?${queryString}` : ""}${normalizedHash}`;
}

export const HoverPrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  function HoverPrefetchLink({ href, prefetch = true, onMouseEnter, ...rest }, ref) {
    const router = useRouter();
    const prefetched = useRef(false);

    const formattedHref = useMemo(() => formatHref(href), [href]);

    const handleMouseEnter = useCallback(
      (event: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);

        if (event.defaultPrevented || prefetched.current || prefetch === false) {
          return;
        }

        if (!formattedHref) {
          return;
        }

        prefetched.current = true;

        startTransition(() => {
          router.prefetch(formattedHref);
        });
      },
      [formattedHref, onMouseEnter, prefetch, router],
    );

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={prefetch}
        onMouseEnter={handleMouseEnter}
        {...rest}
      />
    );
  },
);

HoverPrefetchLink.displayName = "HoverPrefetchLink";

