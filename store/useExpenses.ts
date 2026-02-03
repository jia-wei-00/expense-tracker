import { supabase } from "@/lib/supabase";
import { create } from "zustand";
import type { Database } from "@/database.types";
import { useSessionStore } from "@/store/useSession";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "@/lib/storage";

type TExpense = Database["public"]["Tables"]["expense"]["Row"];
export interface IExpensesStore {
  expenses: TExpense[] | null;
  isFetching: boolean;
  setExpenses: (expenses: TExpense[]) => void;
  getExpenses: () => Promise<void>;
}

export const useExpensesStore = create<IExpensesStore>()(
  persist(
    (set) => ({
      expenses: null,
      isFetching: false,
      setExpenses: (expenses) => set({ expenses }),
      getExpenses: async () => {
        set({ isFetching: true });
        try {
          const { data, error } = await supabase
            .from("expense")
            .select("*")
            .eq("user_id", useSessionStore.getState().getUserId());

          if (error) throw error;
          set({ expenses: data });
        } catch {
          // TODO: show error toast
        } finally {
          set({ isFetching: false });
        }
      },
    }),
    {
      name: "expenses",
      storage: createJSONStorage(() => storage),
    },
  ),
);
