import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { IExpense, TAddExpense } from "@/types/store/useExpenses";
import { QUERY_KEY } from "@/constants/query-key";

export const useInfiniteExpenses = (
  limit = 15,
): UseInfiniteQueryResult<InfiniteData<IExpense[]>, Error> => {
  const userId = useSessionStore((state) => state.getUserId());

  return useInfiniteQuery({
    queryKey: [QUERY_KEY.EXPENSES, userId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from("expense")
        .select("*,category(name)")
        .eq("user_id", userId!)
        .order("spend_date", { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

      if (error) throw error;

      return data.map((expense) => ({
        ...expense,
        category: expense.category?.name ?? "Uncategorized",
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExpenseById = (id: number) => {
  const { data } = useInfiniteExpenses();
  const expenses = data?.pages.flat() ?? [];
  return expenses.find((expense) => expense.id === id);
};

export const useAddExpense = () => {
  return useMutation({
    mutationFn: async (expense: TAddExpense) => {
      const { data, error } = await supabase
        .from("expense")
        .insert(expense)
        .select();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    mutationFn: async (expense: TAddExpense) => {
      if (!expense.id) return;
      const { data, error } = await supabase
        .from("expense")
        .update(expense)
        .eq("id", expense.id)
        .select();
      if (error) throw error;
      return data;
    },
  });
};

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("expense").delete().eq("id", id);
      if (error) throw error;
    },
  });
};
