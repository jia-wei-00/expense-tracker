import { supabase } from "@/lib/supabase";
import { create } from "zustand";
import type { ICategoryStore } from "@/types/store/useCategory";
import { useSessionStore } from "@/store/useSession";
import { createJSONStorage, persist } from "zustand/middleware";
import storage from "@/lib/storage";

export const useCategoryStore = create<ICategoryStore>()(
  persist(
    (set, get) => ({
      category: null,
      isFetching: false,
      setCategory: (category) => set({ category }),
      getCategory: async () => {
        const userId = useSessionStore.getState().getUserId();
        if (!userId) return;

        set({ isFetching: true });
        try {
          const { data, error } = await supabase
            .from("expense_category")
            .select("*")
            .eq("user_id", userId);

          if (error) throw error;
          set({ category: data });
        } catch {
          // TODO: show error toast
        } finally {
          set({ isFetching: false });
        }
      },
      getCategoryNameById: (id) => {
        if (!id) return null;
        return get().category?.find((category) => category.id === id)?.name;
      },
    }),
    {
      name: "category",
      storage: createJSONStorage(() => storage),
    },
  ),
);
