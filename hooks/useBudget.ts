import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { useErrorToast } from "@/hooks/useErrorToast";
import type { TAddBudget, TUpdateBudget } from "@/types/hooks/use-budget";

// 23505 = unique_violation: one budget per category
const isUniqueViolation = (error: Error) =>
  "code" in error && String(error.code) === "23505";

export const useBudgets = () => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.BUDGETS, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget")
        .select("*, expense_category(name)")
        .order("category", { ascending: true, nullsFirst: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddBudget = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("budget");

  return useMutation({
    mutationFn: async (budget: TAddBudget) => {
      const { data, error } = await supabase
        .from("budget")
        .insert({ ...budget, user_id: userId! })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BUDGETS, userId] });
    },
    onError: (error) => {
      showError(isUniqueViolation(error) ? t("error.exists") : t("error.save"));
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("budget");

  return useMutation({
    mutationFn: async ({ id, ...updates }: TUpdateBudget) => {
      const { error } = await supabase
        .from("budget")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BUDGETS, userId] });
    },
    onError: (error) => {
      showError(isUniqueViolation(error) ? t("error.exists") : t("error.save"));
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("budget");

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("budget").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BUDGETS, userId] });
    },
    onError: () => showError(t("error.delete")),
  });
};
