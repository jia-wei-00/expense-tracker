import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { AI_BASE_URL } from "@/constants/api";

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const useWhatsAppUser = () => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.WHATSAPP_USER, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_users")
        .select("phone_number, is_verified")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveWhatsAppUser = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const session = useSessionStore((state) => state.session);
  const { showError } = useErrorToast();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: ({ phone_number }: { phone_number: string }) =>
      fetch(`${AI_BASE_URL}/whatsapp/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({ phoneNumber: phone_number }),
      }).then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.WHATSAPP_USER, userId],
      });
    },
    onError: () => showError(t("whatsapp.error.save")),
  });
};

export const useResendWhatsAppVerification = () => {
  const session = useSessionStore((state) => state.session);
  const { showError } = useErrorToast();
  const toast = useToast();
  const { t } = useTranslation("settings");

  return useMutation({
    mutationFn: () =>
      fetch(`${AI_BASE_URL}/whatsapp/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
      }).then((res) => {
        if (!res.ok) throw new HttpError(res.status, res.statusText);
        return res.json();
      }),
    onSuccess: () => {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="success">
            <ToastTitle>{t("whatsapp.verification_sent")}</ToastTitle>
          </Toast>
        ),
      });
    },
    onError: (error) => {
      if (error instanceof HttpError) {
        if (error.status === 409) return;
        if (error.status === 404) {
          showError(t("whatsapp.error.no_number"));
          return;
        }
      }
      showError(t("whatsapp.error.resend"));
    },
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
