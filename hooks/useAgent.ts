import { useState, useCallback, useRef } from "react";
import { useSessionStore } from "@/store/useSession";
import { useCategory, useAddCategory } from "@/hooks/useCategory";
import { useAddExpense } from "@/hooks/useExpenses";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useTranslation } from "react-i18next";
import type { TChatMessage, ParsedExpense } from "@/types/page/agent";

const genId = () => Math.random().toString(36).slice(2);

const parseDataStream = (text: string) => {
  let textContent = "";
  let parsedExpenses: ParsedExpense[] | null = null;

  for (const line of text.split("\n")) {
    if (line.startsWith("0:")) {
      try {
        textContent += JSON.parse(line.slice(2));
      } catch {
        // skip malformed line
      }
    } else if (line.startsWith("a:")) {
      try {
        const obj = JSON.parse(line.slice(2));
        if (obj.toolName === "parse_expenses" && obj.result?.items) {
          parsedExpenses = obj.result.items as ParsedExpense[];
        }
      } catch {
        // skip malformed line
      }
    }
  }

  return { textContent: textContent.trim(), parsedExpenses };
};

export const useAgentChat = () => {
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref so sendMessage always sees latest messages without stale closure
  const messagesRef = useRef<TChatMessage[]>([]);
  messagesRef.current = messages;

  const { t } = useTranslation("agent");
  const { showError } = useErrorToast();

  const session = useSessionStore((state) => state.session);
  const userId = useSessionStore((state) => state.getUserId());
  const { data: categories = [] } = useCategory();
  const { mutateAsync: addExpense } = useAddExpense();
  const { mutateAsync: addCategory } = useAddCategory();

  const sendMessage = useCallback(
    async (userText: string) => {
      const userMsg: TChatMessage = {
        id: genId(),
        role: "user",
        content: userText,
      };

      setMessages((prev) => [...prev, userMsg]);

      const loadingId = genId();
      setMessages((prev) => [
        ...prev,
        { id: loadingId, role: "assistant", content: "", isLoading: true },
      ]);
      setIsStreaming(true);

      try {
        const history = [...messagesRef.current, userMsg]
          .filter((m) => !m.isLoading)
          .map((m) => ({
            role: m.role as "user" | "assistant",
            // Summarise pending suggestion messages so the AI has context
            content:
              m.suggestions && m.suggestions.length > 0
                ? "[Expense items presented to user for review]"
                : m.content,
          }))
          .filter((m) => m.content.length > 0);

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token ?? ""}`,
              apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
            },
            body: JSON.stringify({ messages: history, categories }),
          },
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        const { textContent, parsedExpenses } = parseDataStream(text);

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== loadingId) return m;
            if (parsedExpenses && parsedExpenses.length > 0) {
              return { ...m, isLoading: false, suggestions: parsedExpenses };
            }
            return { ...m, isLoading: false, content: textContent || t("error") };
          }),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? { ...m, isLoading: false, content: t("error") }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [categories, session, t],
  );

  const updateSuggestion = useCallback(
    (messageId: string, index: number, updated: ParsedExpense) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !m.suggestions) return m;
          const suggestions = [...m.suggestions];
          suggestions[index] = updated;
          return { ...m, suggestions };
        }),
      );
    },
    [],
  );

  const removeSuggestion = useCallback(
    (messageId: string, index: number) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !m.suggestions) return m;
          return {
            ...m,
            suggestions: m.suggestions.filter((_, i) => i !== index),
          };
        }),
      );
    },
    [],
  );

  const submitSuggestions = useCallback(
    async (messageId: string, suggestions: ParsedExpense[]) => {
      if (!userId) return;
      setIsSubmitting(true);

      try {
        // Create any new categories first, then resolve their IDs
        const resolved = await Promise.all(
          suggestions.map(async (s) => {
            if (s.is_new_category) {
              const newCat = await addCategory({
                name: s.category_name,
                is_expense: s.is_expense,
              });
              return { ...s, category_id: newCat.id };
            }
            return s;
          }),
        );

        // Insert all expenses; use allSettled so one failure doesn't abort others.
        // useAddExpense's own onError toast handles individual failures.
        const results = await Promise.allSettled(
          resolved.map((s) =>
            addExpense({
              name: s.name,
              amount: s.amount,
              is_expense: s.is_expense,
              spend_date: s.spend_date,
              category: s.category_id,
              user_id: userId,
            }),
          ),
        );

        if (results.every((r) => r.status === "fulfilled")) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, suggestions: undefined, content: t("suggestions.saved") }
                : m,
            ),
          );
        }
      } catch {
        // Catches addCategory failures (no mutation-level onError there)
        showError(t("error"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, addCategory, addExpense, t, showError],
  );

  const clearSuggestions = useCallback(
    (messageId: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, suggestions: undefined, content: t("suggestions.cleared") }
            : m,
        ),
      );
    },
    [t],
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
