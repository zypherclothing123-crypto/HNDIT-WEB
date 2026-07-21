"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

function getSystemDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: "light" | "dark" | "system"): "light" | "dark" {
  if (mode === "system") return getSystemDark() ? "dark" : "light";
  return mode;
}

/**
 * Applies `light` | `dark` class to <html> with 200ms-friendly CSS transitions.
 * Persists user choice via Zustand + localStorage; respects prefers-color-scheme when mode is system.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const setResolved = useThemeStore((s) => s.setResolved);

  useEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const apply = () => {
      const r = resolve(theme);
      setResolved(r);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(r);
    };

    apply();

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => apply();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme, setResolved]);

  return <>{children}</>;
}
