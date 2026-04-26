import React from "react";
import { ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ParsedExpense } from "@/types/page/agent";
import { ISuggestionsPanel } from "@/types/components/agent/suggestions-panel";
import ExpenseSuggestionCard from "@/components/agent/ExpenseSuggestionCard";

const SuggestionsPanel = ({
  suggestions,
  isSubmitting,
  onApproveAll,
  onClear,
  onUpdate,
  onRemove,
}: ISuggestionsPanel) => {
  const { t } = useTranslation("agent");

  return (
    <Box className="self-start max-w-[92%] rounded-2xl rounded-bl-sm bg-background-100 p-3">
      <Text className="text-xs text-typography-500 mb-2">
        {t("suggestions.title")}
      </Text>
      <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
        {suggestions.map((s, i) => (
          <ExpenseSuggestionCard
            key={i}
            suggestion={s}
            onChange={(updated: ParsedExpense) => onUpdate(i, updated)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </ScrollView>
      <HStack space="sm" className="pt-2">
        <Button variant="outline" size="sm" onPress={onClear} className="flex-1">
          <ButtonText>{t("clear")}</ButtonText>
        </Button>
        <Button
          size="sm"
          onPress={onApproveAll}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <ButtonSpinner />
              <ButtonText className="ml-2">{t("submitting")}</ButtonText>
            </>
          ) : (
            <ButtonText>{t("approve.all")}</ButtonText>
          )}
        </Button>
      </HStack>
    </Box>
  );
};

export default SuggestionsPanel;
