"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { isDark, isReady, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showDarkState = isMounted && isDark;
  const label = !isMounted || !isReady
    ? "Toggle theme"
    : showDarkState
      ? "Use light theme"
      : "Use dark theme";
  const visualState = showDarkState ? "dark" : "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="md"
      onClick={() => {
        if (!isReady) {
          return;
        }

        toggleTheme();
      }}
      aria-label={label}
      aria-pressed={showDarkState}
      className="gap-2 rounded-full border border-border-soft px-4 text-sm hover:bg-background-muted"
    >
      <span
        aria-hidden="true"
        data-state={visualState}
        className="theme-toggle-visual"
      >
        <SunMedium data-icon="sun" className="h-5 w-5" />
        <MoonStar data-icon="moon" className="h-5 w-5" />
      </span>
      <span>{label}</span>
    </Button>
  );
}
