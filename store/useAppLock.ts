import { create } from "zustand";
import storage from "@/lib/storage";
import type { IAppLockStore } from "@/types/store/useAppLock";

const APP_LOCK_STORAGE_KEY = "app_lock_enabled";

/**
 * useAppLock holds the biometric app lock preference, persisted in MMKV
 */
export const useAppLockStore = create<IAppLockStore>((set) => ({
  enabled: storage.getItem(APP_LOCK_STORAGE_KEY) === "true",
  setEnabled: (enabled) => {
    storage.setItem(APP_LOCK_STORAGE_KEY, String(enabled));
    set({ enabled });
  },
}));
