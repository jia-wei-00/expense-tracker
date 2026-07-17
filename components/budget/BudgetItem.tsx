import React from "react";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { useCurrencyStore } from "@/store/useCurrency";
import { IBudgetItem } from "@/types/components/budget/budget-item";

const BudgetItem = ({ budget, onEdit, onDelete }: IBudgetItem) => {
  const { t } = useTranslation("budget");
  const symbol = useCurrencyStore((state) => state.symbol);
  const name = budget.expense_category?.name ?? t("overall");

  return (
    <Pressable onPress={() => onEdit(budget)}>
      <HStack className="p-2 items-center justify-between" space="md">
        <Text className="flex-1" numberOfLines={1}>
          {name}
        </Text>
        <Text bold>
          {symbol}
          {budget.amount}
        </Text>
        <Pressable onPress={() => onDelete(budget)} hitSlop={8}>
          <Icon as={Trash2} size="sm" className="text-error-500" />
        </Pressable>
      </HStack>
    </Pressable>
  );
};

export default BudgetItem;
