import ActionSheet from "@/components/shared/ActionSheet";
import Container from "@/components/shared/Container";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { CATEGORY_ICON_MAP } from "@/constants/icon-map";
import { useDeleteExpense, useExpenseById } from "@/hooks/useExpenses";
import { categorySchema } from "@/types/constant/icon-map";
import { safeParseAny } from "@/utils/zod-utils";
import { useCurrencyStore } from "@/store/useCurrency";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const ExpenseDetails = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { t } = useTranslation("common");
  const symbol = useCurrencyStore((state) => state.symbol);
  const [isOpened, setIsOpened] = useState(false);
  const expense = useExpenseById(Number(id));
  const { mutateAsync: deleteExpense, isPending: isDeleting } =
    useDeleteExpense();

  if (!id) return null;

  const date = dayjs(expense?.spend_date).format("dddd • YYYY-MM-DD");

  const safeCategory = safeParseAny(
    categorySchema,
    expense?.category,
    "Others",
  );
  const IconComponent = CATEGORY_ICON_MAP[safeCategory];
  const prefix = expense?.is_expense ? "-" : "+";

  const handleDeleteExpense = async () => {
    await deleteExpense({
      id: Number(id),
      spend_date: expense?.spend_date ?? "",
    });
    router.back();
  };

  const handlePress = () => {
    router.push({
      pathname: "/expense/expense-details/update",
      params: { id: String(id) },
    });
  };

  return (
    <Container className="py-5">
      <VStack space="md">
        <Center>
          <Box className="rounded-full p-5 bg-background-100">
            <Icon as={IconComponent} size="xl" />
          </Box>
        </Center>

        <VStack className="items-center" space="md">
          <HStack space="xs">
            <Text size="4xl" bold className="text-center">
              {prefix}
              {symbol}
            </Text>
            <Text size="4xl" bold className="text-center">
              {expense?.amount}
            </Text>
          </HStack>
          <Text size="xl" bold className="text-center">
            {expense?.name}
          </Text>
          <Text size="xs" className="text-center">
            {expense?.category}
          </Text>
          <Text className="text-center" size="lg">
            {date}
          </Text>
        </VStack>

        <Box className="bg-background-50 p-5 rounded-xl">
          <Text size="lg" bold>
            {t("note")}
          </Text>
        </Box>
        <Button className="rounded-full" onPress={handlePress}>
          <ButtonText>{t("update")}</ButtonText>
        </Button>
        <Button
          className="rounded-full"
          variant="link"
          action="negative"
          onPress={() => setIsOpened(true)}
        >
          <ButtonText>{t("delete")}</ButtonText>
        </Button>
      </VStack>

      <ActionSheet
        title={t("confirm.delete")}
        isOpen={isOpened}
        onClose={() => setIsOpened(false)}
        description={t("delete.confirmation.message", { item: expense?.name })}
        isLoading={isDeleting}
        primaryButtonLabel={t(isDeleting ? "deleting" : "delete")}
        primaryButtonAction={handleDeleteExpense}
        secondaryButtonLabel={t("cancel")}
        secondaryButtonAction={() => setIsOpened(false)}
      />
    </Container>
  );
};

export default ExpenseDetails;
