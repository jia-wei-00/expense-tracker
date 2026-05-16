import { supabase } from "@/lib/supabase";
import {
  TMessage,
  TPendingToolCall,
  TAiChatResponse,
} from "@/types/hooks/use-agent";
import { useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState<
    TPendingToolCall[] | null
  >(null);

  const sendMessage = async (userText: string) => {
    if (loading || !userText.trim()) return;

    const userMsg: TMessage = { role: "user", content: userText.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setPendingToolCall(null); // clear any previous pending action

    const { data, error } = await supabase.functions.invoke<TAiChatResponse>(
      "ai-chat",
      {
        body: {
          messages: updated,
        },
      },
    );

    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
      setLoading(false);
      return;
    }

    // Show AI reply
    if (data?.message) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    }

    // If AI wants to write to DB, hold it for user confirmation
    if (data?.pendingToolCalls) {
      setPendingToolCall(data.pendingToolCalls);
    }

    setLoading(false);
  };

  // ---- User taps Confirm ----
  const confirmAction = async () => {
    if (!pendingToolCall || pendingToolCall.length === 0) return;
    setLoading(true);

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

    console.log(toDelete, "toDelete");

    const [addResult, ...deleteResults] = await Promise.all([
      toAdd.length > 0 ? supabase.from("expense").insert(toAdd) : null,
      ...toDelete.map((id) => supabase.from("expense").delete().eq("id", id)),
    ]);

    const hasError = addResult?.error || deleteResults.some((r) => r.error);

    if (hasError) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Some actions failed. Please try again.",
        },
      ]);
    } else {
      const parts: string[] = [];
      if (toAdd.length > 0)
        parts.push(
          `${toAdd.length} expense${toAdd.length > 1 ? "s" : ""} saved`,
        );
      if (toDelete.length > 0)
        parts.push(
          `${toDelete.length} expense${toDelete.length > 1 ? "s" : ""} deleted`,
        );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `✅ ${parts.join(" and ")}!` },
      ]);
    }

    setPendingToolCall(null);
    setLoading(false);
  };

  // ---- User taps Cancel ----
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

  // ---- Clear chat ----
  const clearMessages = () => {
    setMessages([]);
    setPendingToolCall(null);
  };

  return {
    messages,
    loading,
    pendingToolCall,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
  };
}
