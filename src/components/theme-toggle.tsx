"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { isDark, isReady, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showDarkState = mounted && isDark;

  const label = useMemo(() => {
    if (!mounted || !isReady) {
      return "Toggle theme";
    }

    return showDarkState ? "Use light theme" : "Use dark theme";
  }, [isReady, mounted, showDarkState]);

  const handleToggle = useCallback(() => {
    if (!isReady) {
      return;
    }

    toggleTheme();
  }, [isReady, toggleTheme]);

  const icon = showDarkState ? (
    <SunMedium className="h-5 w-5" aria-hidden="true" />
  ) : (
    <MoonStar className="h-5 w-5" aria-hidden="true" />
  );

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={showDarkState}
      className="gap-2 rounded-full border border-border-soft px-4 text-sm hover:bg-background-muted"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

