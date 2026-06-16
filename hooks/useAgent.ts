import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { AI_BASE_URL } from "@/constants/api";
import storage from "@/lib/storage";
import {
  TMessage,
  TMessageContentPart,
  TMediaAttachment,
  TPendingToolCall,
  TAiChatResponse,
  TChatRequest,
} from "@/types/hooks/use-agent";

export const CHAT_CONTEXT_LIMIT = 20_000;

const SESSION_ID_KEY = "ai_chat_session_id";
const MESSAGES_KEY = "ai_chat_messages";

const readString = (key: string): string | null => {
  const v = storage.getItem(key);
  return typeof v === "string" ? v : null;
};

const loadInitialMessages = (): TMessage[] => {
  const raw = readString(MESSAGES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TMessage[]) : [];
  } catch {
    return [];
  }
};

const estimateTokens = (messages: TMessage[]): number => {
  let chars = 0;
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      chars += msg.content.length;
    } else {
      for (const part of msg.content) {
        if (part.type === "text") chars += part.text.length;
        // Image parts: a rough constant — most providers bill ~85 tokens per
        // low-detail image; we round to 340 chars to fit the chars/4 heuristic.
        else if (part.type === "image_url") chars += 340;
        // Audio parts: a rough constant placeholder for a short voice clip.
        else if (part.type === "audio_url") chars += 340;
      }
    }
  }
  return Math.ceil(chars / 4);
};

export function useChat() {
  const [messages, setMessages] = useState<TMessage[]>(loadInitialMessages);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    readString(SESSION_ID_KEY),
  );
  const [pendingToolCall, setPendingToolCall] = useState<
    TPendingToolCall[] | null
  >(null);

  const session = useSessionStore((state) => state.session);

  useEffect(() => {
    storage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) storage.setItem(SESSION_ID_KEY, sessionId);
    else storage.removeItem(SESSION_ID_KEY);
  }, [sessionId]);

  const { mutateAsync: callAI, isPending: isSending } = useMutation<
    TAiChatResponse,
    Error,
    TChatRequest
  >({
    mutationFn: (body) => {
      const url = `${AI_BASE_URL}/chat`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`,
        }),
      };
      console.log("[ai-chat] →", {
        url,
        headers: {
          ...headers,
          Authorization: headers.Authorization ? "Bearer ***" : undefined,
        },
        body: JSON.stringify(body),
      });
      return fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorBody = await res.text();
            console.log("[ai-chat] ←", {
              status: res.status,
              ok: res.ok,
              statusText: res.statusText,
              body: errorBody,
            });
            throw new Error(errorBody || res.statusText || `HTTP ${res.status}`);
          }
          console.log("[ai-chat] ←", { status: res.status, ok: res.ok });
          return res.json();
        })
        .catch((err) => {
          console.log("[ai-chat] ✖", err?.message ?? err);
          throw err;
        });
    },
    onSuccess: (data) => {
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message as string },
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

  const { mutateAsync: executeActions, isPending: isConfirming } = useMutation({
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
        ...toDelete.map((id) => supabase.from("expense").delete().eq("id", id)),
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
  });

  const sendMessage = async (
    userText: string,
    media?: TMediaAttachment,
  ) => {
    if (isSending || (!userText.trim() && !media)) return;

    const trimmed = userText.trim();

    let displayContent: TMessage["content"];
    if (media) {
      const parts: TMessageContentPart[] = [];
      if (trimmed) parts.push({ type: "text", text: trimmed });
      parts.push(
        media.kind === "audio"
          ? { type: "audio_url", audio_url: { url: media.url } }
          : { type: "image_url", image_url: { url: media.url } },
      );
      displayContent = parts;
    } else {
      displayContent = trimmed;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: displayContent },
    ]);
    setPendingToolCall(null);

    await callAI({
      message: trimmed,
      ...(media
        ? {
            attachments: [
              {
                url: media.url,
                contentType:
                  media.kind === "audio" ? "audio/mp4" : "image/jpeg",
                name: media.url.split("/").pop(),
              },
            ],
          }
        : {}),
      ...(sessionId ? { sessionId } : {}),
    });
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
    setSessionId(null);
  };

  const tokenEstimate = useMemo(() => estimateTokens(messages), [messages]);

  return {
    messages,
    loading: isSending || isConfirming,
    pendingToolCall,
    sessionId,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    removeItem,
    tokenEstimate,
    contextLimit: CHAT_CONTEXT_LIMIT,
  };
}
