import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { AI_BASE_URL } from "@/constants/api";
import {
  TMessage,
  TMessageContentPart,
  TPendingToolCall,
  TAiChatResponse,
} from "@/types/hooks/use-agent";

export function useChat() {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [pendingToolCall, setPendingToolCall] = useState<
    TPendingToolCall[] | null
  >(null);

  const session = useSessionStore((state) => state.session);

  const { mutateAsync: callAI, isPending: isSending } = useMutation<
    TAiChatResponse,
    Error,
    TMessage[]
  >({
    mutationFn: (msgs) =>
      fetch(`${AI_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({ messages: msgs }),
      }).then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      }),
    onSuccess: (data) => {
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
      if (data.pendingToolCalls) {
        setPendingToolCall(data.pendingToolCalls);
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    },
  });

  const { mutateAsync: executeActions, isPending: isConfirming } = useMutation(
    {
      mutationFn: async () => {
        if (!pendingToolCall?.length) return null;

        const toAdd = pendingToolCall
          .filter((tc) => tc.toolName === "addExpense")
          .map((tc) => ({
            name: tc.args.name!,
            amount: tc.args.amount!,
            category: tc.args.category!,
            is_expense: tc.args.is_expense ?? true,
            spend_date: tc.args.spend_date ?? new Date().toISOString(),
          }));

        const toDelete = pendingToolCall
          .filter((tc) => tc.toolName === "deleteExpense")
          .map((tc) => tc.args.id!);

        const [addResult, ...deleteResults] = await Promise.all([
          toAdd.length > 0 ? supabase.from("expense").insert(toAdd) : null,
          ...toDelete.map((id) =>
            supabase.from("expense").delete().eq("id", id),
          ),
        ]);

        if (addResult?.error || deleteResults.some((r) => r.error)) {
          throw new Error("Some actions failed");
        }

        return { toAdd, toDelete };
      },
      onSuccess: (result) => {
        setPendingToolCall(null);
        if (!result) return;

        const parts: string[] = [];
        if (result.toAdd.length > 0) {
          const list = result.toAdd
            .map((e) => `• ${e.name} — RM ${e.amount.toFixed(2)}`)
            .join("\n");
          parts.push(`Saved:\n${list}`);
        }
        if (result.toDelete.length > 0) {
          parts.push(
            `${result.toDelete.length} expense${result.toDelete.length > 1 ? "s" : ""} deleted`,
          );
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `✅ ${parts.join("\n\n")}` },
        ]);
      },
      onError: () => {
        setPendingToolCall(null);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Some actions failed. Please try again.",
          },
        ]);
      },
    },
  );

  const sendMessage = async (userText: string, imageUrl?: string) => {
    if (isSending || (!userText.trim() && !imageUrl)) return;

    let content: TMessage["content"];
    if (imageUrl) {
      const parts: TMessageContentPart[] = [];
      if (userText.trim()) parts.push({ type: "text", text: userText.trim() });
      parts.push({ type: "image_url", image_url: { url: imageUrl } });
      content = parts;
    } else {
      content = userText.trim();
    }

    const updated = [...messages, { role: "user" as const, content }];
    setMessages(updated);
    setPendingToolCall(null);
    await callAI(updated);
  };

  const confirmAction = () => executeActions();

  const removeItem = (index: number) => {
    setPendingToolCall((prev) => {
      if (!prev) return null;
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : null;
    });
  };

  const cancelAction = () => {
    setPendingToolCall(null);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Cancelled! Anything else I can help with?",
      },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
    setPendingToolCall(null);
  };

  return {
    messages,
    loading: isSending || isConfirming,
    pendingToolCall,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    removeItem,
  };
}
