import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { create } from "zustand";
import type { ISessionStore } from "@/types/store/useSession";

/**
 * useSession contain all the session related state and functions
 */
export const useSessionStore = create<ISessionStore>((set, get) => ({
  session: null,
  isSessionLoading: false,
  setSession: (session) => set({ session }),
  getSession: async () => {
    try {
      set({ isSessionLoading: true });

      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;
      get().setSession(data.session);
    } catch (error) {
      if (error instanceof AuthError) {
        // TODO: show auth error toast
      } else {
        // TODO: show server error toast
      }
      throw error;
    } finally {
      set({ isSessionLoading: false });
    }
  },
  getUserId: () => get().session?.user.id,
}));
