"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { CompareProductSnapshot } from "@/lib/comparison";

const CompareContext = createContext<CompareContextValue | undefined>(undefined);
const STORAGE_KEY = "ezc-compare-products";
const MAX_ITEMS = 3;

type CompareContextValue = {
  items: CompareProductSnapshot[];
  isSelected: (id: string) => boolean;
  toggle: (product: CompareProductSnapshot) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareProductSnapshot[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CompareProductSnapshot[];
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_ITEMS));
        }
      }
    } catch (error) {
      console.error("Failed to restore comparison set", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CompareContextValue>(() => {
    const isSelected = (id: string) => items.some((item) => item.id === id);

    const toggle = (product: CompareProductSnapshot) => {
      setItems((current) => {
        const exists = current.some((item) => item.id === product.id);
        if (exists) {
          return current.filter((item) => item.id !== product.id);
        }
        if (current.length >= MAX_ITEMS) {
          const [, ...rest] = current;
          return [...rest, product];
        }
        return [...current, product];
      });
    };

    const remove = (id: string) => {
      setItems((current) => current.filter((item) => item.id !== id));
    };

    const clear = () => setItems([]);

    return { items, isSelected, toggle, remove, clear };
  }, [items]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
