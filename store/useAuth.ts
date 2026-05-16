import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { create } from "zustand";
import type { IAuthStore } from "@/types/store/useAuth";

/**
 * useAuth contain all the session related state and functions
 */
export const useAuthStore = create<IAuthStore>((set) => ({
  isAuthLoading: false,
  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    useSessionStore.getState().setSession(session);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        useSessionStore.getState().setSession(session);
      },
    );
  },
  signUp: async ({ email, password }) => {
    try {
      set({ isAuthLoading: true });
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    } catch (error) {
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
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
    // const queryClient = useQueryClient();

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
      // queryClient.clear();
      set({ isAuthLoading: false });
    }
  },
}));
