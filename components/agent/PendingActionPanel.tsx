import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { IPendingActionPanel } from "@/types/components/agent/pending-action-panel";
import type { TPendingToolCall } from "@/types/hooks/use-agent";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TransactionItem from "@/components/shared/TransactionItem";

const ExpenseSeparator = () => <Divider className="my-1" />;

const PendingActionPanel = ({
  pendingToolCalls,
  categories,
  onConfirm,
  onCancel,
}: IPendingActionPanel) => {
  const { t } = useTranslation("agent");

  const { addExpense, deleteExpense } = useMemo(() => {
    return pendingToolCalls.reduce<
      Record<TPendingToolCall["toolName"], TPendingToolCall["args"][]>
    >(
      (acc, item) => {
        acc[item.toolName].push(item.args);
        return acc;
      },
      { addExpense: [], deleteExpense: [] },
    );
  }, [pendingToolCalls]);

  const previewExpenses = useMemo(
    () =>
      addExpense.map((item, index) => {
        console.log(item);

        return {
          id: -(index + 1),
          name: item.name ?? "",
          amount: item.amount ?? 0,
          category:
            categories?.find((c) => c.id === item.category)?.name ?? "Others",
          spend_date: item.spend_date ?? new Date().toISOString(),
          is_expense: item.is_expense ?? true,
        };
      }),
    [addExpense, categories],
  );

  return (
    <Box className="border border-outline-200 rounded-xl p-3 mb-2 bg-background-100">
      <Text className="text-xs text-typography-500 mb-3">
        {t("pending.title")}
      </Text>

      {previewExpenses.length > 0 && (
        <VStack className="bg-background-0 rounded-2xl border border-outline-50 px-3 py-2 mb-3">
          {previewExpenses.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <ExpenseSeparator />}
              <TransactionItem
                id={item.id}
                name={item.name}
                category={item.category}
                spend_date={item.spend_date}
                is_expense={item.is_expense}
                amount={item.amount}
                test="AI"
              />
            </React.Fragment>
          ))}
        </VStack>
      )}

      {deleteExpense.length > 0 && (
        <Text className="text-sm text-typography-900 mb-3">
          {t("pending.delete")}
        </Text>
      )}

      <HStack space="sm">
        <Button
          variant="outline"
          size="sm"
          onPress={onCancel}
          className="flex-1"
        >
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
