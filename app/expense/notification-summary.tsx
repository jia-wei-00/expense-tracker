import React from "react";
import { Pressable } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ChevronRight } from "lucide-react-native";
import Container from "@/components/shared/Container";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { parseExpensePush } from "@/lib/expensePush";
import { TPushExpenseItem } from "@/types/notification";

export default function NotificationSummaryScreen() {
  const { t } = useTranslation("notification");
  const { t: tCommon } = useTranslation("common");
  const { payload } = useLocalSearchParams<{ payload?: string }>();

  const data = parseExpensePush(payload);
  const rm = tCommon("currency.prefix");

  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title: t("title") }} />
        <Container>
          <Box className="flex-1 items-center justify-center py-24">
            <Text className="text-typography-500">{t("empty")}</Text>
          </Box>
        </Container>
      </>
    );
  }

  const title =
    data.type === "EXPENSE_UPDATED" ? t("updatedTitle") : t("addedTitle");
  const count = data.count ?? data.expenses.length;
  const total =
    data.totalAmount ??
    data.expenses.reduce((sum, item) => sum + item.amount, 0);

  const openDetails = (item: TPushExpenseItem) => {
    if (item.id === undefined || item.id === null) return;
    router.push({
      pathname: "/expense/expense-details/[id]",
      params: { id: String(item.id) },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Container>
        <VStack space="lg" className="pt-2">
          <Box className="rounded-2xl bg-background-100 p-5">
            <HStack space="sm" className="items-center">
              <Icon as={CheckCircle2} className="text-success-600" />
              <Heading size="lg">{t("subtitle", { count })}</Heading>
            </HStack>
            <HStack className="mt-4 items-end justify-between">
              <Text className="text-typography-500">{t("total")}</Text>
              <Heading size="xl">
                {rm} {total.toFixed(2)}
              </Heading>
            </HStack>
          </Box>

          <VStack space="xs">
            {data.expenses.map((item, index) => {
              const tappable = item.id !== undefined && item.id !== null;
              return (
                <Pressable
                  key={index}
                  onPress={() => openDetails(item)}
                  disabled={!tappable}
                >
                  <HStack className="items-center justify-between rounded-xl bg-background-50 px-4 py-3">
                    <Text className="flex-1 text-typography-900">
                      {item.name}
                    </Text>
                    <HStack space="sm" className="items-center">
                      <Text className="font-semibold text-typography-900">
                        {rm} {item.amount.toFixed(2)}
                      </Text>
                      {tappable && (
                        <Icon
                          as={ChevronRight}
                          size="sm"
                          className="text-typography-400"
                        />
                      )}
                    </HStack>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </Container>
    </>
  );
}
