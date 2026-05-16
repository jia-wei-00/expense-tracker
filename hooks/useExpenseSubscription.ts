import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { IExpense, TExpense } from "@/types/store/useExpenses";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { QUERY_KEY } from "@/constants/query-key";
import { TCategory } from "@/types/store/useCategory";
import { useEffect } from "react";

export const useExpenseSubscription = () => {
  const userId = useSessionStore((state) => state.getUserId());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${userId}_expense`)
      .on<TExpense>(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense" },
        (payload) => {
          const { eventType, new: expense, old } = payload;

          const getCategoryName = (categoryId: number | null) => {
            const categories = queryClient.getQueryData<TCategory[]>([
              QUERY_KEY.CATEGORIES,
            ]);

            if (!categoryId || !categories) return "Uncategorized";
            return (
              categories.find((c) => c.id === categoryId)?.name ??
              "Uncategorized"
            );
          };

          queryClient.setQueryData<InfiniteData<IExpense[]>>(
            [QUERY_KEY.EXPENSES, userId],
            (oldData) => {
              if (!oldData) return oldData;

              switch (eventType) {
                case "INSERT": {
                  const newExpense = {
                    ...expense,
                    category: getCategoryName(expense.category),
                  };
                  const isDupe = oldData.pages.some((page) =>
                    page.some((e) => e.id === newExpense.id),
                  );
                  if (isDupe) return oldData;
                  return {
                    ...oldData,
                    pages: oldData.pages.map((page, i) =>
                      i === 0 ? [newExpense, ...page] : page,
                    ),
                  };
                }
                case "UPDATE": {
                  const updatedExpense = {
                    ...expense,
                    category: getCategoryName(expense.category),
                  };
                  return {
                    ...oldData,
                    pages: oldData.pages.map((page) =>
                      page.map((e) => (e.id === old.id ? updatedExpense : e)),
                    ),
                  };
                }
                case "DELETE":
                  return {
                    ...oldData,
                    pages: oldData.pages.map((page) =>
                      page.filter((e) => e.id !== old.id),
                    ),
                  };
                default:
                  return oldData;
              }
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
