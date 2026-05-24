import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { TWhatsAppUserRow } from "@/types/hooks/use-whatsapp-subscription";

export const useWhatsAppSubscription = () => {
  const userId = useSessionStore((state) => state.getUserId());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${userId}_whatsapp`)
      .on<TWhatsAppUserRow>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "whatsapp_users",
          filter: `user_id=eq.${userId}`,
        },
        ({ new: updated }) => {
          queryClient.setQueryData([QUERY_KEY.WHATSAPP_USER, userId], {
            phone_number: updated.phone_number,
            is_verified: updated.is_verified,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
