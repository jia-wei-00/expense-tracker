import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "@/store/useSession";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useErrorToast } from "@/hooks/useErrorToast";
import { AI_BASE_URL } from "@/constants/api";
import type { TAiChatResponse } from "@/types/hooks/use-agent";
import type { TReceiptScanResult } from "@/types/hooks/use-receipt-scan";

// English on purpose: this is a machine instruction for the AI backend, not UI copy
const SCAN_PROMPT =
  "Extract the expense from this receipt image and call addExpense with the " +
  "extracted name, amount, category and date. Do not ask any questions.";

export const useReceiptScan = () => {
  const session = useSessionStore((state) => state.session);
  const { pickAndUpload, isUploading } = useImageUpload();
  const { showError } = useErrorToast();
  const { t } = useTranslation("details");

  const { mutateAsync, isPending } = useMutation<
    TReceiptScanResult | null,
    Error,
    "gallery" | "camera"
  >({
    mutationFn: async (source) => {
      const url = await pickAndUpload(source);
      if (!url) return null;

      const response = await fetch(`${AI_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          message: SCAN_PROMPT,
          attachments: [
            {
              url,
              contentType: "image/jpeg",
              name: url.split("/").pop(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || response.statusText);
      }

      const data: TAiChatResponse = await response.json();
      const extracted = data.pendingToolCalls?.find(
        (toolCall) => toolCall.toolName === "addExpense",
      );
      if (!extracted) throw new Error("No expense extracted");

      return extracted.args;
    },
    onError: () => showError(t("scan.failed")),
  });

  return {
    scanReceipt: mutateAsync,
    isScanning: isPending || isUploading,
  };
};
