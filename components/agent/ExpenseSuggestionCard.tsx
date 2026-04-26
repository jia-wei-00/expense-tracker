import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { IExpenseSuggestionCard } from "@/types/components/agent/expense-suggestion-card";

const ExpenseSuggestionCard = ({
  suggestion,
  onChange,
  onRemove,
}: IExpenseSuggestionCard) => {
  const { t } = useTranslation("common");

  return (
    <Box className="border border-outline-200 rounded-xl p-3 mb-2 bg-background-50">
      <HStack className="justify-between items-start mb-2">
        <HStack space="xs" className="items-center flex-1">
          <Box
            className={`rounded px-2 py-0.5 ${suggestion.is_expense ? "bg-error-100" : "bg-success-100"}`}
          >
            <Text className={`text-xs font-medium ${suggestion.is_expense ? "text-error-700" : "text-success-700"}`}>
              {suggestion.is_expense ? "Expense" : "Income"}
            </Text>
          </Box>
          {suggestion.is_new_category && (
            <Box className="rounded px-2 py-0.5 bg-warning-100">
              <Text className="text-xs font-medium text-warning-700">
                {t("category.new", { ns: "agent" })}
              </Text>
            </Box>
          )}
        </HStack>
        <Button variant="link" size="sm" onPress={onRemove}>
          <Icon as={X} size="sm" />
        </Button>
      </HStack>

      <VStack space="sm">
        <HStack space="sm" className="items-center">
          <Text className="text-xs text-typography-500 w-16">Name</Text>
          <Input variant="underlined" size="sm" className="flex-1">
            <InputField
              value={suggestion.name}
              onChangeText={(v) => onChange({ ...suggestion, name: v })}
            />
          </Input>
        </HStack>

        <HStack space="sm" className="items-center">
          <Text className="text-xs text-typography-500 w-16">Amount</Text>
          <HStack className="items-center flex-1">
            <Text className="text-sm mr-1">{t("currency.prefix")}</Text>
            <Input variant="underlined" size="sm" className="flex-1">
              <InputField
                value={String(suggestion.amount)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  onChange({ ...suggestion, amount: parseFloat(v) || 0 })
                }
              />
            </Input>
          </HStack>
        </HStack>

        <HStack space="sm" className="items-center">
          <Text className="text-xs text-typography-500 w-16">Category</Text>
          <Input variant="underlined" size="sm" className="flex-1">
            <InputField
              value={suggestion.category_name}
              onChangeText={(v) =>
                onChange({ ...suggestion, category_name: v })
              }
            />
          </Input>
        </HStack>

        <HStack space="sm" className="items-center">
          <Text className="text-xs text-typography-500 w-16">Date</Text>
          <Input variant="underlined" size="sm" className="flex-1">
            <InputField
              value={suggestion.spend_date}
              onChangeText={(v) =>
                onChange({ ...suggestion, spend_date: v })
              }
            />
          </Input>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ExpenseSuggestionCard;
