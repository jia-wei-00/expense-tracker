import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useTranslation } from "react-i18next";

export const useWhatsAppUser = () => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.WHATSAPP_USER, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_users")
        .select("phone_number")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data; // null when not registered
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveWhatsAppUser = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: async ({
      phone_number,
      hasExisting,
    }: {
      phone_number: string;
      hasExisting: boolean;
    }) => {
      // No UPDATE RLS policy — delete the old row first, then insert
      if (hasExisting) {
        const { error: deleteError } = await supabase
          .from("whatsapp_users")
          .delete()
          .eq("user_id", userId!);
        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from("whatsapp_users")
        .insert({ phone_number, user_id: userId! });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.WHATSAPP_USER, userId],
      });
    },
    onError: () => showError(t("whatsapp.error.save")),
  });
};

export const useDeleteWhatsAppUser = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const { showError } = useErrorToast();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("whatsapp_users")
        .delete()
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.WHATSAPP_USER, userId],
      });
    },
    onError: () => showError(t("whatsapp.error.delete")),
  });
};
