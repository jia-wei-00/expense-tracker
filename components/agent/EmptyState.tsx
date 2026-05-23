import React from "react";
import { Pressable, ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Icon } from "@/components/ui/icon";
import { Bot, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const SUGGESTIONS = [
  "I had lunch RM15 and coffee RM8",
  "How much did I spend this month?",
  "Show my recent expenses",
  "Delete my last expense",
] as const;

interface IEmptyState {
  onSuggestion: (text: string) => void;
}

const EmptyState = ({ onSuggestion }: IEmptyState) => {
  const { t } = useTranslation("agent");

  return (
    <VStack className="flex-1 items-center justify-center" space="xl">
      <VStack className="items-center" space="sm">
        <Box className="w-16 h-16 rounded-full items-center justify-center bg-[rgb(235,234,234)] dark:bg-[rgb(55,54,54)]">
          <Icon as={Bot} size="xl" />
        </Box>
        <Text className="text-typography-900 font-semibold text-lg text-center">
          {t("title")}
        </Text>
        <Text className="text-typography-400 text-sm text-center leading-relaxed px-6">
          {t("empty.hint")}
        </Text>
      </VStack>

      <VStack className="w-full px-2" space="sm">
        <Box className="flex-row items-center gap-1">
          <Icon as={Sparkles} size="xs" className="text-typography-400" />
          <Text className="text-xs text-typography-400">{t("empty.try")}</Text>
        </Box>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box className="flex-row gap-2 pb-1">
            {SUGGESTIONS.map((suggestion) => (
              <Pressable key={suggestion} onPress={() => onSuggestion(suggestion)}>
                <Box className="px-[14px] py-[9px] rounded-[20px] border border-[rgb(220,219,219)] dark:border-[rgb(80,79,79)] bg-[rgb(242,241,241)] dark:bg-[rgb(55,54,54)]">
                  <Text className="text-[13px] text-[rgb(60,60,60)] dark:text-[rgb(220,220,220)]">
                    {suggestion}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </Box>
        </ScrollView>
      </VStack>
    </VStack>
  );
};

export default EmptyState;
