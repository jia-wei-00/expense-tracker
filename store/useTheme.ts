import { create } from "zustand";
import storage from "@/lib/storage";
import type { IThemeStore, TThemeMode } from "@/types/store/useTheme";

const THEME_STORAGE_KEY = "theme";

export const isThemeMode = (value: unknown): value is TThemeMode =>
  value === "light" || value === "dark" || value === "system";

// MMKV reads are synchronous, so the persisted mode is available on first render
const getInitialMode = (): TThemeMode => {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(stored) ? stored : "dark";
};

/**
 * useTheme holds the user-selected color scheme (light / dark / system),
 * persisted in MMKV under "theme"
 */
export const useThemeStore = create<IThemeStore>((set) => ({
  mode: getInitialMode(),
  setMode: (mode) => {
    storage.setItem(THEME_STORAGE_KEY, mode);
    set({ mode });
  },
}));
