"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full opacity-0">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
        resolvedTheme === "dark"
          ? "bg-slate-800 border-white/10 hover:border-[#ffd200]/50 hover:bg-slate-700 shadow-[0_0_10px_rgba(255,210,0,0.1)] hover:shadow-[0_0_15px_rgba(255,210,0,0.3)]"
          : "bg-white border-slate-200 hover:border-[#005581]/30 hover:bg-slate-50 shadow-sm hover:shadow-md"
      }`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 text-[#ffd200] transition-transform duration-500 hover:rotate-90" />
      ) : (
        <Moon className="h-5 w-5 text-[#005581] transition-transform duration-500 hover:-rotate-12" />
      )}
    </button>
  );
}
