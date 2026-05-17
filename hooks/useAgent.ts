import { supabase } from "@/lib/supabase";
import {
  TMessage,
  TMessageContentPart,
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

  const sendMessage = async (userText: string, imageUrl?: string) => {
    if (loading || (!userText.trim() && !imageUrl)) return;

    let content: TMessage["content"];
    if (imageUrl) {
      const parts: TMessageContentPart[] = [];
      if (userText.trim()) parts.push({ type: "text", text: userText.trim() });
      parts.push({ type: "image", url: imageUrl });
      content = parts;
    } else {
      content = userText.trim();
    }

    const userMsg: TMessage = { role: "user", content };
    const updated = [...messages, userMsg];
    console.log(updated);
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
      if (toAdd.length > 0) {
        const list = toAdd
          .map((e) => `• ${e.name} — RM ${e.amount.toFixed(2)}`)
          .join("\n");
        parts.push(`Saved:\n${list}`);
      }
      if (toDelete.length > 0)
        parts.push(
          `${toDelete.length} expense${toDelete.length > 1 ? "s" : ""} deleted`,
        );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `✅ ${parts.join("\n\n")}` },
      ]);
    }

    setPendingToolCall(null);
    setLoading(false);
  };

  // ---- User removes one pending item ----
  const removeItem = (index: number) => {
    setPendingToolCall((prev) => {
      if (!prev) return null;
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : null;
    });
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
    removeItem,
  };
}
