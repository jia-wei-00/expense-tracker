import { SupportedStorage } from "@supabase/supabase-js";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV({
  id: "expense-tracker-storage",
  encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY,
});

const storage: SupportedStorage = {
  setItem: (name, value) => {
    return mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.remove(name);
  },
};

export default storage;
