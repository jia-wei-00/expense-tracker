import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { create } from "zustand";

export type TSignInPayload = {
  email: string;
  password: string;
};

interface IAuthStore {
  isAuthLoading: boolean;
  /**
   * Inherit Supabase onAuthStateChange will update the session store
   */
  onAuthStageChange: () => void;
  /**
   * Sign in a user with email and password
   * @param email
   * @param password
   */
  signIn: (payload: TSignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * useAuth contain all the session related state and functions
 */
export const useAuthStore = create<IAuthStore>((set) => ({
  isAuthLoading: false,
  onAuthStageChange: () => {
    supabase.auth.onAuthStateChange((_event, session) => {
      useSessionStore.getState().setSession(session);
    });
  },
  signIn: async ({ email, password }) => {
    try {
      set({ isAuthLoading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      useSessionStore.getState().setSession(data.session);
    } catch (error) {
      // TODO: show error toast
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
  },
  signOut: async () => {
    try {
      set({ isAuthLoading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // TODO: show success toast
    } catch (error) {
      // TODO: show error toast
      throw error;
    } finally {
      useSessionStore.getState().setSession(null);
      set({ isAuthLoading: false });
    }
  },
}));
