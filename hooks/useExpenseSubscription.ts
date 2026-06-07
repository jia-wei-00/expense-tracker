import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { IExpense, TExpense } from "@/types/store/useExpenses";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { QUERY_KEY } from "@/constants/query-key";
import { TCategory } from "@/types/store/useCategory";
import { useEffect } from "react";
import dayjs from "dayjs";

const isMonthKey = (key: unknown): key is string =>
  typeof key === "string" && /^\d{4}-\d{2}$/.test(key);

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

          // Invalidate monthly chart queries unconditionally — they don't depend
          // on the infinite-expenses cache, so they must refresh even when that
          // cache is empty.
          if (eventType === "INSERT" || eventType === "UPDATE") {
            if (expense.spend_date) {
              queryClient.invalidateQueries({
                queryKey: [dayjs(expense.spend_date).format("YYYY-MM")],
              });
            }
            if (
              eventType === "UPDATE" &&
              old.spend_date &&
              old.spend_date !== expense.spend_date
            ) {
              queryClient.invalidateQueries({
                queryKey: [dayjs(old.spend_date).format("YYYY-MM")],
              });
            }
          } else if (eventType === "DELETE") {
            queryClient.invalidateQueries({
              predicate: (query) => isMonthKey(query.queryKey[0]),
            });
          }

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
