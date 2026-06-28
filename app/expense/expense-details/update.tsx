import ExpenseForm from "@/components/expense-details/input-form";
import Container from "@/components/shared/Container";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useGetCategoryIdByName } from "@/hooks/useCategory";
import { useExpenseById, useUpdateExpense } from "@/hooks/useExpenses";
import {
  createAddExpenseSchema,
  type TAddExpenseInput,
  type TAddExpenseOutput,
} from "@/types/page/add-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const UpdateExpense = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const expense = useExpenseById(Number(id));
  const { t } = useTranslation("details");
  const { mutateAsync: updateExpense, isPending: isLoading } =
    useUpdateExpense();

  const categoryId = useGetCategoryIdByName(expense?.category);

  const methods = useForm<TAddExpenseInput, unknown, TAddExpenseOutput>({
    resolver: zodResolver(createAddExpenseSchema(t)),
    defaultValues: {
      amount: expense?.amount ?? 0,
      ...(categoryId && { category: categoryId }),
      is_expense: expense?.is_expense ?? true,
      spend_date:
        dayjs(expense?.spend_date).toISOString() ?? dayjs().toISOString(),
      name: expense?.name ?? "",
    },
  });

  const isExpenseWatch = useWatch({
    control: methods.control,
    name: "is_expense",
  });
  const { setValue } = methods;

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setValue("category", 0);
  }, [isExpenseWatch, setValue]);

  if (!id) return null;

  const onSubmit = (data: TAddExpenseOutput) => {
    updateExpense({ ...data, id: Number(id) }).then(() => router.back());
  };

  return (
    <Container>
      <FormProvider {...methods}>
        <ExpenseForm isExpense={isExpenseWatch}>
          <Button
            variant="solid"
            size="md"
            action="primary"
            className="mt-5 rounded-full gap-4"
            onPress={methods.handleSubmit(onSubmit)}
          >
            {isLoading && <ButtonSpinner color="white" />}
            <ButtonText>
              {t(isLoading ? "update.loading" : "update")}
            </ButtonText>
          </Button>
        </ExpenseForm>
      </FormProvider>
    </Container>
  );
};

export default UpdateExpense;
