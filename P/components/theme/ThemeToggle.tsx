"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/stores/theme-store";

/**
 * Toggles light ↔ dark. When current mode is system, switches to explicit opposite of resolved theme.
 */
export function ThemeToggle() {
  const { resolved, setTheme, theme } = useTheme();

  const toggle = () => {
    if (theme === "system") {
      setTheme(resolved === "dark" ? "light" : "dark");
      return;
    }
    setTheme(resolved === "dark" ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full transition-all duration-200"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {resolved === "dark" ? (
        <Sun className="h-5 w-5 text-amber-300" />
      ) : (
        <Moon className="h-5 w-5 text-[#534AB7]" />
      )}
    </Button>
  );
}
