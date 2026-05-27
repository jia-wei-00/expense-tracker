import { Box } from "@/components/ui/box";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Icon } from "@/components/ui/icon";
import { IPendingActionPanel } from "@/types/components/agent/pending-action-panel";
import type { TPendingToolCall } from "@/types/hooks/use-agent";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TransactionItem from "@/components/shared/TransactionItem";
import { X, CircleAlert } from "lucide-react-native";

const ExpenseSeparator = () => <Divider className="my-1" />;

const PendingActionPanel = ({
  pendingToolCalls,
  categories,
  onConfirm,
  onCancel,
  onRemoveItem,
}: IPendingActionPanel) => {
  const { t } = useTranslation("agent");

  const { addExpense, deleteExpense } = useMemo(() => {
    return pendingToolCalls.reduce<{
      addExpense: { args: TPendingToolCall["args"]; originalIndex: number }[];
      deleteExpense: {
        args: TPendingToolCall["args"];
        originalIndex: number;
      }[];
    }>(
      (acc, item, index) => {
        acc[item.toolName].push({ args: item.args, originalIndex: index });
        return acc;
      },
      { addExpense: [], deleteExpense: [] },
    );
  }, [pendingToolCalls]);

  const previewExpenses = useMemo(
    () =>
      addExpense.map(({ args: item, originalIndex }, index) => ({
        id: -(index + 1),
        originalIndex,
        name: item.name ?? "",
        amount: item.amount ?? 0,
        category:
          categories?.find((c) => c.id === item.category)?.name ?? "Others",
        spend_date: item.spend_date ?? new Date().toISOString(),
        is_expense: item.is_expense ?? true,
      })),
    [addExpense, categories],
  );

  return (
    <Box className="border border-outline-200 rounded-2xl p-3 mb-2 bg-background-100">
      <HStack className="items-center mb-3" space="xs">
        <Icon as={CircleAlert} size="xs" className="text-typography-500" />
        <Text className="text-xs text-typography-500 font-medium flex-1">
          {t("pending.title")}
        </Text>
      </HStack>

      {previewExpenses.length > 0 && (
        <VStack className="bg-background-0 rounded-2xl border border-outline-50 px-3 py-2 mb-3">
          {previewExpenses.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <ExpenseSeparator />}
              <HStack className="items-center">
                <Box className="flex-1">
                  <TransactionItem
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    spend_date={item.spend_date}
                    is_expense={item.is_expense}
                    amount={item.amount}
                  />
                </Box>
                <Button
                  variant="link"
                  size="sm"
                  onPress={() => onRemoveItem(item.originalIndex)}
                >
                  <ButtonIcon as={X} className="text-typography-400" />
                </Button>
              </HStack>
            </React.Fragment>
          ))}
        </VStack>
      )}

      {deleteExpense.length > 0 && (
        <VStack className="mb-3" space="xs">
          {deleteExpense.map(({ args, originalIndex }) => (
            <HStack
              key={originalIndex}
              className="items-center justify-between bg-background-0 rounded-xl px-3 py-2 border border-outline-50"
            >
              <VStack>
                <Text className="text-sm text-typography-900">
                  {t("pending.delete")}
                </Text>
                <Text size="sm">
                  #{args.id} - {args.name}
                </Text>
              </VStack>
              <Button
                variant="link"
                size="sm"
                onPress={() => onRemoveItem(originalIndex)}
              >
                <ButtonIcon as={X} className="text-typography-400" />
              </Button>
            </HStack>
          ))}
        </VStack>
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
