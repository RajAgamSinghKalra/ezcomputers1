"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileFieldProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  action?: string;
  theme?: "auto" | "light" | "dark";
};

export function TurnstileField({ siteKey, onToken, onExpire, action = "form", theme = "auto" }: TurnstileFieldProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId();

  useEffect(() => {
    if (!siteKey) return;

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.turnstile) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load Turnstile"));
        document.head.appendChild(script);
      });

    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !elementRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(elementRef.current, {
          sitekey: siteKey,
          action,
          theme,
          callback: (token: string) => onToken(token),
          "error-callback": () => onExpire?.(),
          "expired-callback": () => {
            onExpire?.();
            onToken("");
          },
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, action, theme, onExpire, onToken, id]);

  return <div ref={elementRef} className="cf-turnstile" data-sitekey={siteKey} />;
}
