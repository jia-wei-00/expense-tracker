import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams } from "expo-router";
import { safeParseAny } from "@/utils/zod-utils";
import { CATEGORY_ICON_MAP } from "@/constants/icon-map";
import { categorySchema } from "@/types/constant/icon-map";
import { Icon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import dayjs from "dayjs";
import { useExpensesStore } from "@/store/useExpenses";
import { IExpense } from "@/types/store/useExpenses";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import Container from "@/components/shared/Container";
import { Button, ButtonText } from "@/components/ui/button";
import ActionSheet from "@/components/shared/ActionSheet";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

const ExpenseDetails = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  if (!id) return null;

  const { t } = useTranslation("common");
  const [isOpened, setIsOpened] = useState(false);
  const [expense, setExpense] = useState<IExpense | undefined>(undefined);
  const getExpenseById = useExpensesStore((state) => state.getExpenseById);
  const isLoading = useExpensesStore((state) => state.isFetching);
  const deleteExpense = useExpensesStore((state) => state.deleteExpense);

  const handleExpense = async () => {
    const expense = await getExpenseById(Number(id));
    setExpense(expense);
  };

  React.useEffect(() => {
    handleExpense();
  }, [id]);

  const date = dayjs(expense?.spend_date).format("dddd • YYYY-MM-DD");

  const safeCategory = safeParseAny(
    categorySchema,
    expense?.category,
    "Others",
  );
  const IconComponent = CATEGORY_ICON_MAP[safeCategory];
  const prefix = expense?.is_expense ? "-" : "+";

  const handleDeleteExpense = () => {
    deleteExpense(Number(id));
    router.back();
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
              RM
            </Text>
            <Text size="4xl" bold className="text-center">
              {expense?.amount}
            </Text>
          </HStack>
          <Text size="xl" bold className="text-center">
            {expense?.name}
          </Text>
          <Text className="text-center" size="lg">
            {date}
          </Text>
        </VStack>

        <Box className="bg-background-50 p-5 rounded-xl">
          <Text size="lg" bold>
            Note
          </Text>
        </Box>
        <Button className="rounded-full">
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
        isLoading={isLoading}
        primaryButtonLabel={t(isLoading ? "deleting" : "delete")}
        primaryButtonAction={handleDeleteExpense}
        secondaryButtonLabel={t("cancel")}
        secondaryButtonAction={() => setIsOpened(false)}
      />
    </Container>
  );
};

export default ExpenseDetails;
