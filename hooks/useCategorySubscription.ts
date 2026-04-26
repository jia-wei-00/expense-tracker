import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/constants/query-key";
import { TCategory } from "@/types/store/useCategory";
import { useEffect } from "react";

export const useCategorySubscription = () => {
  const userId = useSessionStore((state) => state.getUserId());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${userId}_category`)
      .on<TCategory>(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_category" },
        (payload) => {
          const { eventType, new: newCategory, old } = payload;

          queryClient.setQueryData<TCategory[]>(
            [QUERY_KEY.CATEGORIES, userId],
            (oldData) => {
              if (!oldData) return oldData;

              switch (eventType) {
                case "INSERT": {
                  const isDupe = oldData.some((e) => e.id === newCategory.id);
                  if (isDupe) return oldData;
                  return [...oldData, newCategory];
                }
                case "UPDATE": {
                  return oldData.map((e) =>
                    e.id === old.id ? newCategory : e,
                  );
                }
                case "DELETE":
                  return oldData.filter((e) => e.id !== old.id);
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
