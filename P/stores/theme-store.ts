import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

/** Avoid touching `localStorage` during SSR (throws → Fast Refresh full reload in dev). */
const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemeMode;
  /** Effective theme applied to <html> */
  resolved: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  /** Called by ThemeProvider when system preference or storage changes */
  setResolved: (resolved: "light" | "dark") => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolved: "light",
      setTheme: (theme) => set({ theme }),
      setResolved: (resolved) => set({ resolved }),
    }),
    {
      name: "hndit-theme",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage
      ),
      partialize: (s) => ({ theme: s.theme }),
      skipHydration: true,
    }
  )
);

/** Hook: theme mode, resolved light/dark, setter */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);
  return {
    theme,
    resolved,
    setTheme,
    isDark: resolved === "dark",
  };
}
