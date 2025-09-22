"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const THEME_STORAGE_KEY = "ezc-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemeName = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  resolvedTheme: ThemeName;
  isDark: boolean;
  isReady: boolean;
  setTheme: (nextTheme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isStoredTheme(value: unknown): value is ThemeName {
  return value === "light" || value === "dark";
}

function applyThemeClass(theme: ThemeName) {
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === "dark";

  root.classList.remove("light", "dark");
  root.setAttribute("data-theme", theme);
  root.classList.add(isDark ? "dark" : "light");
  root.style.colorScheme = theme;

  if (body) {
    body.classList.remove("light", "dark");
    body.setAttribute("data-theme", theme);
    body.classList.add(isDark ? "dark" : "light");
    body.style.colorScheme = theme;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const currentTheme = root.getAttribute("data-theme");
      if (isStoredTheme(currentTheme)) {
        return currentTheme;
      }
      if (root.classList.contains("dark")) {
        return "dark";
      }
    }
    return "light";
  });
  const [isReady, setIsReady] = useState(false);
  const userPreference = useRef<ThemeName | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isStoredTheme(stored)) {
      userPreference.current = stored;
    } else {
      userPreference.current = null;
    }

    const prefersDark = window.matchMedia(DARK_MEDIA_QUERY).matches;
    const initialTheme: ThemeName = userPreference.current ?? (prefersDark ? "dark" : "light");

    setThemeState(initialTheme);
    applyThemeClass(initialTheme);
    setIsReady(true);

    const media = window.matchMedia(DARK_MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      if (userPreference.current) {
        return;
      }

      const nextTheme: ThemeName = event.matches ? "dark" : "light";
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      if (isStoredTheme(event.newValue)) {
        userPreference.current = event.newValue;
        setThemeState(event.newValue);
        applyThemeClass(event.newValue);
        return;
      }

      userPreference.current = null;
      const prefersDark = window.matchMedia(DARK_MEDIA_QUERY).matches;
      const nextTheme: ThemeName = prefersDark ? "dark" : "light";
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setTheme = useCallback((nextTheme: ThemeName) => {
    if (typeof window === "undefined") {
      return;
    }

    userPreference.current = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
    applyThemeClass(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeName = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme, theme]);

  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme: theme,
      isDark: theme === "dark",
      isReady,
      setTheme,
      toggleTheme,
    };
  }, [isReady, setTheme, theme, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
