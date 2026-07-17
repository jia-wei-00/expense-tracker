import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { useErrorToast } from "@/hooks/useErrorToast";
import type {
  TAddRecurring,
  TUpdateRecurring,
} from "@/types/hooks/use-recurring";

export const useRecurringExpenses = () => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.RECURRING, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_expense")
        .select("*, expense_category(name)")
        .order("day_of_month", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddRecurring = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("recurring");

  return useMutation({
    mutationFn: async (recurring: TAddRecurring) => {
      const { data, error } = await supabase
        .from("recurring_expense")
        .insert({ ...recurring, user_id: userId! })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.RECURRING, userId],
      });
    },
    onError: () => showError(t("error.save")),
  });
};

export const useUpdateRecurring = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("recurring");

  return useMutation({
    mutationFn: async ({ id, ...updates }: TUpdateRecurring) => {
      const { error } = await supabase
        .from("recurring_expense")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.RECURRING, userId],
      });
    },
    onError: () => showError(t("error.save")),
  });
};

export const useDeleteRecurring = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("recurring");

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("recurring_expense")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.RECURRING, userId],
      });
    },
    onError: () => showError(t("error.delete")),
  });
};
