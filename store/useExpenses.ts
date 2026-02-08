import { supabase } from "@/lib/supabase";
import { create } from "zustand";
import type { IExpensesStore } from "@/types/store/useExpenses";
import { useSessionStore } from "@/store/useSession";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "@/lib/storage";

export const useExpensesStore = create<IExpensesStore>()(
  persist(
    (set, get) => ({
      expenses: null,
      isFetching: false,
      setExpenses: (expenses) => set({ expenses }),
      getExpenses: async () => {
        const userId = useSessionStore.getState().getUserId();
        if (!userId) return;

        set({ isFetching: true });
        try {
          const { data, error } = await supabase
            .from("expense")
            .select("*,category(name)")
            .eq("user_id", userId)
            .order("spend_date", { ascending: false });

          if (error) throw error;

          const formattedExpenses = data.map((expense) => ({
            ...expense,
            category: expense.category?.name ?? "Uncategorized",
          }));
          set({ expenses: formattedExpenses });
        } catch {
          // TODO: show error toast
        } finally {
          set({ isFetching: false });
        }
      },
      getExpenseById: async (id: number) => {
        set({ isFetching: true });
        try {
          const expense = get().expenses?.find((expense) => expense.id === id);
          if (expense) return expense;

          const { data, error } = await supabase
            .from("expense")
            .select("*,category(name)")
            .eq("id", id);

          if (error) throw error;

          const formattedData = data.map((expense) => ({
            ...expense,
            category: expense.category?.name ?? "Uncategorized",
          }));
          return formattedData[0];
        } catch {
          // TODO: show error toast
        } finally {
          set({ isFetching: false });
        }
      },
      deleteExpense: async (id: number) => {
        set({ isFetching: true });
        try {
          const { error } = await supabase
            .from("expense")
            .delete()
            .eq("id", id);
          if (error) throw error;
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
