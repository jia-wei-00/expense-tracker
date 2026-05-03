import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { IPendingActionPanel } from "@/types/components/agent/pending-action-panel";
import React from "react";
import { useTranslation } from "react-i18next";

const PendingActionPanel = ({
  pendingToolCall,
  categories,
  onConfirm,
  onCancel,
}: IPendingActionPanel) => {
  const { t } = useTranslation("agent");
  const { t: tc } = useTranslation("common");
  const { toolName, args } = pendingToolCall;

  const categoryName =
    categories?.find((c) => c.id === args.category)?.name ?? "Unknown";

  return (
    <Box className="border border-outline-200 rounded-xl p-3 mb-2 bg-background-100">
      <Text className="text-xs text-typography-500 mb-2">
        {t("pending.title")}
      </Text>

      {toolName === "addExpense" && (
        <VStack space="xs" className="mb-3">
          <HStack space="xs" className="items-center">
            <Box
              className={`rounded px-2 py-0.5 ${args.is_expense ? "bg-error-100" : "bg-success-100"}`}
            >
              <Text
                className={`text-xs font-medium ${args.is_expense ? "text-error-700" : "text-success-700"}`}
              >
                {args.is_expense ? "Expense" : "Income"}
              </Text>
            </Box>
          </HStack>
          <Text className="text-sm font-medium text-typography-900">
            {args.name}
          </Text>
          <Text className="text-xs text-typography-500">
            {tc("currency.prefix")} {args.amount} · {categoryName} ·{" "}
            {args.spend_date}
          </Text>
        </VStack>
      )}

      {toolName === "deleteExpense" && (
        <Text className="text-sm text-typography-900 mb-3">
          {t("pending.delete")}
        </Text>
      )}

      <HStack space="sm">
        <Button variant="outline" size="sm" onPress={onCancel} className="flex-1">
          <ButtonText>{t("cancel")}</ButtonText>
        </Button>
        <Button size="sm" onPress={onConfirm} className="flex-1">
          <ButtonText>{t("confirm")}</ButtonText>
        </Button>
      </HStack>
    </Box>
  );
};

export default PendingActionPanel;
