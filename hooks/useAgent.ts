import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";
import { ParsedExpense, TChatMessage } from "@/types/page/agent";
import dayjs from "dayjs";

const EDGE_FN_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`;

function parseDataStream(line: string): {
  type: "text" | "tool_result" | "finish" | "unknown";
  value: string;
} {
  if (line.startsWith("0:")) {
    try {
      return { type: "text", value: JSON.parse(line.slice(2)) };
    } catch {
      return { type: "text", value: line.slice(2) };
    }
  }
  if (line.startsWith("a:")) {
    return { type: "tool_result", value: line.slice(2) };
  }
  if (line.startsWith("d:")) {
    return { type: "finish", value: line.slice(2) };
  }
  return { type: "unknown", value: line };
}

interface UseAgentChatOptions {
  categories: { id: number; name: string; is_expense: boolean }[];
}

export const useAgentChat = ({ categories }: UseAgentChatOptions) => {
  const { t } = useTranslation("agent");
  const userId = useSessionStore.getState().getUserId();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: TChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };
      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: TChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
      setIsStreaming(true);

      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(EDGE_FN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: history, categories }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // React Native's fetch doesn't reliably support body streaming,
        // so we read the full response and parse all lines at once.
        const text = await response.text();
        const lines = text.split("\n");

        let accText = "";
        let parsedSuggestions: ParsedExpense[] | null = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const parsed = parseDataStream(trimmed);

          if (parsed.type === "text") {
            accText += parsed.value;
          } else if (parsed.type === "tool_result") {
            try {
              const toolData = JSON.parse(parsed.value);
              if (
                toolData?.toolName === "parse_expenses" &&
                toolData?.result?.items
              ) {
                parsedSuggestions = toolData.result.items;
              }
            } catch {
              // non-JSON tool data, ignore
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            if (parsedSuggestions) {
              // Suggestions go inline in the message — the chat bubble
              // becomes an editable review card (human-in-the-loop).
              return {
                ...m,
                content: accText,
                isLoading: false,
                suggestions: parsedSuggestions,
              };
            }
            return { ...m, content: accText, isLoading: false };
          }),
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: t("error"),
                  isLoading: false,
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, categories, t],
  );

  const updateSuggestion = useCallback(
    (messageId: string, index: number, updated: ParsedExpense) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                suggestions: m.suggestions?.map((s, i) =>
                  i === index ? updated : s,
                ),
              }
            : m,
        ),
      );
    },
    [],
  );

  const removeSuggestion = useCallback(
    (messageId: string, index: number) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                suggestions: m.suggestions?.filter((_, i) => i !== index),
              }
            : m,
        ),
      );
    },
    [],
  );

  const resolveSuggestions = useCallback(
    (messageId: string, resolvedContent: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, suggestions: undefined, content: resolvedContent }
            : m,
        ),
      );
    },
    [],
  );

  const submitSuggestions = useCallback(
    async (messageId: string, suggestions: ParsedExpense[]) => {
      setIsSubmitting(true);
      try {
        const resolvedSuggestions = await Promise.all(
          suggestions.map(async (s) => {
            if (s.is_new_category) {
              const { data, error } = await supabase
                .from("expense_category")
                .insert({
                  name: s.category_name,
                  is_expense: s.is_expense,
                  user_id: userId!,
                })
                .select()
                .single();
              if (error) throw error;
              return { ...s, category_id: data.id, is_new_category: false };
            }
            return s;
          }),
        );

        const rows = resolvedSuggestions.map((s) => ({
          name: s.name,
          amount: s.amount,
          is_expense: s.is_expense,
          spend_date: s.spend_date,
          category: s.category_id,
          user_id: userId!,
        }));

        const { error } = await supabase.from("expense").insert(rows);
        if (error) throw error;

        const affectedMonths = new Set(
          resolvedSuggestions.map((s) => dayjs(s.spend_date).format("YYYY-MM")),
        );
        for (const monthKey of affectedMonths) {
          queryClient.invalidateQueries({ queryKey: [monthKey] });
        }
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.EXPENSES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORIES] });

        resolveSuggestions(messageId, t("suggestions.saved"));
      } catch {
        // Leave suggestions on the message so the user can retry
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, queryClient, resolveSuggestions, t],
  );

  const clearSuggestions = useCallback(
    (messageId: string) => {
      resolveSuggestions(messageId, t("suggestions.cleared"));
    },
    [resolveSuggestions, t],
  );

  return {
    messages,
    isStreaming,
    isSubmitting,
    sendMessage,
    updateSuggestion,
    removeSuggestion,
    submitSuggestions,
    clearSuggestions,
  };
};
