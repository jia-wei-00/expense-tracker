import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { IPendingActionPanel } from "@/types/components/agent/pending-action-panel";
import type { TPendingToolCall } from "@/types/hooks/use-agent";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import TransactionItem from "@/components/shared/TransactionItem";
import { Divider } from "../ui/divider";

const ExpenseSeparator = () => <Divider className="my-2" />;

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
      {
        addExpense: [],
        deleteExpense: [],
      },
    );
  }, [pendingToolCalls]);

  console.log("addExpense", addExpense);
  console.log("deleteExpense", deleteExpense);

  const previewExpenses = useMemo(
    () =>
      addExpense.map((item, index) => ({
        id: -(index + 1),
        name: item.name ?? "",
        amount: item.amount ?? 0,
        category:
          categories?.find((category) => category.id === item.category)?.name ??
          "Others",
        spend_date: item.spend_date ?? new Date().toISOString(),
        is_expense: item.is_expense ?? true,
      })),
    [addExpense, categories],
  );

  const previewListHeight = Math.min(
    Math.max(previewExpenses.length * 76, 96),
    320,
  );

  return (
    <Box className="border border-outline-200 rounded-xl p-3 mb-2 bg-background-100">
      <Text className="text-xs text-typography-500 mb-3">
        {t("pending.title")}
      </Text>

      {/* {addExpense.length > 0 && (
        <FlashList
          data={previewExpenses}
          renderItem={({ item }) => (
            <TransactionItem
              {...item}
              created_at={item.spend_date}
              user_id={null}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={ExpenseSeparator}
          ListEmptyComponent={<Text className="px-3">{t("no.expenses")}</Text>}
          contentContainerClassName="bg-background-0 p-3 rounded-2xl border border-outline-50 gap-2"
          style={{ height: previewListHeight }}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.5}
        />
      )} */}

      {addExpense.map((item, index) => (
        <TransactionItem key={index} {...item} user_id={null} />
      ))}

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
        {/* <Button
          size="sm"
          onPress={addExpense ? handleApprove : () => onConfirm(args)}
          className="flex-1"
        >
          <ButtonText>{t("confirm")}</ButtonText>
        </Button> */}
      </HStack>
    </Box>
  );
};

export default PendingActionPanel;
