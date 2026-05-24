import ExpenseForm from "@/components/expense-details/input-form";
import Container from "@/components/shared/Container";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useAddExpense } from "@/hooks/useExpenses";
import {
  createAddExpenseSchema,
  type TAddExpenseInput,
  type TAddExpenseOutput,
} from "@/types/page/add-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const AddExpense = () => {
  const { t } = useTranslation("details");
  const { mutateAsync: addExpense, isPending: isLoading } = useAddExpense();

  const methods = useForm<TAddExpenseInput, unknown, TAddExpenseOutput>({
    resolver: zodResolver(createAddExpenseSchema(t)),
    defaultValues: {
      is_expense: true,
      spend_date: dayjs().toISOString(),
    },
  });

  const onSubmit = (data: TAddExpenseOutput) => {
    addExpense(data).then(() =>
      methods.reset({
        is_expense: true,
        spend_date: dayjs().toISOString(),
      }),
    );
  };

  const isExpenseWatch = methods.watch("is_expense");
  const { resetField } = methods;

  useEffect(() => {
    resetField("category");
  }, [isExpenseWatch, resetField]);

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
            {isLoading && <ButtonSpinner color="gray" />}
            <ButtonText>{t(isLoading ? "add.loading" : "add")}</ButtonText>
          </Button>
        </ExpenseForm>
      </FormProvider>
    </Container>
  );
};

export default AddExpense;
