"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LogoThemeToggle({ className, imgClassName }: { className?: string, imgClassName?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={className || "flex-shrink-0 bg-white rounded-full h-12 w-12 flex items-center justify-center p-1.5 ml-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#ffd200]"}
      aria-label="Toggle theme by clicking logo"
      title="Toggle Dark/Light Mode"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hnditlogo.png" alt="HNDIT Logo" className={imgClassName || "h-full w-auto object-contain"} />
    </button>
  );
}
