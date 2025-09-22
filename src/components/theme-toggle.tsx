"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { isDark, isReady, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    if (!isReady) {
      return;
    }
    toggleTheme();
  };

  const showDarkState = mounted && isDark;
  const icon = showDarkState ? <SunMedium className="h-5 w-5" aria-hidden /> : <MoonStar className="h-5 w-5" aria-hidden />;
  const label = !mounted || !isReady ? "Toggle theme" : showDarkState ? "Use light theme" : "Use dark theme";

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={handleToggle}
      aria-label={label}
      className="gap-2 rounded-full border border-border-soft px-4 text-sm hover:bg-background-muted"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

  const isDark = mounted && resolvedTheme === "dark";
  const icon = isDark ? <SunMedium className="h-5 w-5" aria-hidden /> : <MoonStar className="h-5 w-5" aria-hidden />;
  const label = !mounted ? "Toggle theme" : isDark ? "Use light theme" : "Use dark theme";

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={handleToggle}
      aria-label={label}
      className="gap-2 rounded-full border border-border-soft px-4 text-sm hover:bg-background-muted"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
