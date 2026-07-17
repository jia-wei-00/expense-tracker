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
import dayjs from "dayjs";
import {
  TExpenseFilters,
  TMonthlySummary,
  TTrendPoint,
} from "@/types/hooks/use-expense";
import { useErrorToast } from "@/hooks/useErrorToast";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useTranslation } from "react-i18next";

// need to refactor this, we just have to fetch limit data to 5 and then
export const useFetchMonthlyExpenses = (month: string | Date) => {
  const userId = useSessionStore((state) => state.getUserId());
  const monthKey = dayjs(month).format("YYYY-MM");

  return useQuery({
    queryKey: [monthKey],
    queryFn: async () => {
      const startOfMonth = dayjs(month).startOf("month").toISOString();
      const startOfNextMonth = dayjs(month)
        .add(1, "month")
        .startOf("month")
        .toISOString();

      const { data, error } = await supabase
        .from("expense")
        .select(
          `
            amount,
            is_expense,
            expense_category (
              name
            )
          `,
        )
        .gte("spend_date", startOfMonth)
        .lt("spend_date", startOfNextMonth);

      if (error) throw error;

      const result: TMonthlySummary = {
        expense: [],
        income: [],
      };

      for (const row of data ?? []) {
        const categoryName = String(row.expense_category?.name);
        const entry = { [categoryName]: Number(row.amount) };

        if (row.is_expense) {
          result.expense.push(entry);
        } else {
          result.income.push(entry);
        }
      }

      return result;
    },
    enabled: !!userId && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const hasActiveExpenseFilters = (filters?: TExpenseFilters) =>
  !!filters &&
  (!!filters.search ||
    (!!filters.type && filters.type !== "all") ||
    !!filters.startDate ||
    !!filters.endDate);

const buildFilteredExpenseQuery = (filters?: TExpenseFilters) => {
  let query = supabase
    .from("expense")
    .select("*,category(name)")
    .order("spend_date", { ascending: false });

  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters?.type === "expense") query = query.eq("is_expense", true);
  if (filters?.type === "income") query = query.eq("is_expense", false);
  if (filters?.startDate) {
    query = query.gte(
      "spend_date",
      dayjs(filters.startDate).startOf("day").toISOString(),
    );
  }
  if (filters?.endDate) {
    query = query.lte(
      "spend_date",
      dayjs(filters.endDate).endOf("day").toISOString(),
    );
  }

  return query;
};

export const useInfiniteExpenses = (
  limit = 15,
  filters?: TExpenseFilters,
): UseInfiniteQueryResult<InfiniteData<IExpense[]>, Error> => {
  const userId = useSessionStore((state) => state.getUserId());

  // Realtime subscriptions only patch the unfiltered cache entry, so filtered
  // views get their own key and refresh through normal staleTime/invalidation.
  const queryKey = hasActiveExpenseFilters(filters)
    ? [QUERY_KEY.EXPENSES, userId, filters]
    : [QUERY_KEY.EXPENSES, userId];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await buildFilteredExpenseQuery(filters).range(
        pageParam * limit,
        (pageParam + 1) * limit - 1,
      );

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

export const useFetchExpenseTrends = (months = 6) => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.TRENDS, userId, months],
    queryFn: async () => {
      const start = dayjs()
        .subtract(months - 1, "month")
        .startOf("month");

      const { data, error } = await supabase
        .from("expense")
        .select("amount,is_expense,spend_date")
        .gte("spend_date", start.toISOString());

      if (error) throw error;

      const buckets = Array.from({ length: months }, (_, i) =>
        start.add(i, "month").format("YYYY-MM"),
      );
      const totals = new Map<string, TTrendPoint>(
        buckets.map((month) => [month, { month, expense: 0, income: 0 }]),
      );

      for (const row of data ?? []) {
        const point = totals.get(dayjs(row.spend_date).format("YYYY-MM"));
        if (!point) continue;
        if (row.is_expense) point.expense += Number(row.amount ?? 0);
        else point.income += Number(row.amount ?? 0);
      }

      return buckets.map((month) => totals.get(month)!);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExportExpensesCsv = () => {
  const { showError } = useErrorToast();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: async (filters?: TExpenseFilters) => {
      const { data, error } = await buildFilteredExpenseQuery(filters);
      if (error) throw error;

      const escapeCell = (value: unknown) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const header = ["Date", "Name", "Category", "Type", "Amount"];
      const rows = (data ?? []).map((expense) =>
        [
          expense.spend_date
            ? dayjs(expense.spend_date).format("YYYY-MM-DD")
            : "",
          expense.name,
          expense.category?.name ?? "",
          expense.is_expense ? "Expense" : "Income",
          expense.amount,
        ]
          .map(escapeCell)
          .join(","),
      );
      const csv = [header.join(","), ...rows].join("\n");

      const file = new File(
        Paths.cache,
        `transactions-${dayjs().format("YYYY-MM-DD")}.csv`,
      );
      if (file.exists) file.delete();
      file.create();
      file.write(csv);

      await Sharing.shareAsync(file.uri, { mimeType: "text/csv" });
    },
    onError: () => showError(t("error.generic")),
  });
};

export const useExpenseById = (id: number) => {
  const { data } = useInfiniteExpenses();
  const expenses = data?.pages.flat() ?? [];
  return expenses.find((expense) => expense.id === id);
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  const { showError } = useErrorToast();
  const { t } = useTranslation("common");
  return useMutation({
    mutationFn: async (expense: TAddExpense | TAddExpense[]) => {
      const { data, error } = await supabase
        .from("expense")
        .insert(Array.isArray(expense) ? expense : [expense])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const monthKeys = new Set(
        (data ?? [])
          .map((row) => row.spend_date)
          .filter((d): d is string => !!d)
          .map((d) => dayjs(d).format("YYYY-MM")),
      );
      monthKeys.forEach((monthKey) =>
        queryClient.invalidateQueries({ queryKey: [monthKey] }),
      );
    },
    onError: () => showError(t("error.save")),
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const { showError } = useErrorToast();
  const { t } = useTranslation("common");
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
    onSuccess: (data) => {
      const monthKeys = new Set(
        (data ?? [])
          .map((row) => row.spend_date)
          .filter((d): d is string => !!d)
          .map((d) => dayjs(d).format("YYYY-MM")),
      );
      monthKeys.forEach((monthKey) =>
        queryClient.invalidateQueries({ queryKey: [monthKey] }),
      );
    },
    onError: () => showError(t("error.save")),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  const { showError } = useErrorToast();
  const { t } = useTranslation("common");
  return useMutation({
    mutationFn: async ({ id }: { id: number; spend_date: string }) => {
      const { error } = await supabase.from("expense").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { spend_date }) => {
      if (spend_date) {
        const monthKey = dayjs(spend_date).format("YYYY-MM");
        queryClient.invalidateQueries({ queryKey: [monthKey] });
      }
    },
    onError: () => showError(t("error.delete")),
  });
};

export const useBulkDeleteExpenses = () => {
  const queryClient = useQueryClient();
  const { showError } = useErrorToast();
  const { t } = useTranslation("common");
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { error } = await supabase.from("expense").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.EXPENSES] });
      queryClient.invalidateQueries({ queryKey: [dayjs().format("YYYY-MM")] });
    },
    onError: () => showError(t("error.delete")),
  });
};
