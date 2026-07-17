import React from "react";
import { Pressable, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useCurrencyStore } from "@/store/useCurrency";
import { cn } from "@/lib/utils";
import { IRecurringItem } from "@/types/components/recurring/recurring-item";

const RecurringItem = ({
  recurring,
  onEdit,
  onDelete,
  onToggleActive,
}: IRecurringItem) => {
  const { t } = useTranslation("recurring");
  const symbol = useCurrencyStore((state) => state.symbol);

  return (
    <Pressable onPress={() => onEdit(recurring)}>
      <HStack className="p-2 items-center" space="md">
        <VStack className={cn("flex-1", !recurring.is_active && "opacity-40")}>
          <Text numberOfLines={1}>{recurring.name}</Text>
          <Text size="xs" className="text-typography-500">
            {t("item.summary", {
              currency: symbol,
              amount: recurring.amount,
              day: recurring.day_of_month,
              category: recurring.expense_category?.name ?? "",
            })}
          </Text>
        </VStack>
        <Switch
          value={recurring.is_active}
          onValueChange={() => onToggleActive(recurring)}
        />
        <Pressable onPress={() => onDelete(recurring)} hitSlop={8}>
          <Icon as={Trash2} size="sm" className="text-error-500" />
        </Pressable>
      </HStack>
    </Pressable>
  );
};

export default RecurringItem;
