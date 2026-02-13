import Container from "@/components/shared/Container";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import ControlledRadio from "@/components/shared/ControlledRadio";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCategoryStore } from "@/store/useCategory";
import { useExpensesStore } from "@/store/useExpenses";
import { addExpenseSchema, TAddExpense } from "@/types/page/add-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const AddExpense = () => {
  const { t } = useTranslation("add");
  const category = useCategoryStore((state) => state.category);
  const isLoading = useExpensesStore((state) => state.isFetching);

  const methods = useForm<TAddExpense>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      is_expense: true,
      spend_date: new Date(),
    },
  });

  const onSubmit = () => {
    console.log(methods.getValues());
  };

  return (
    <Container title={t("add.expense")}>
      <FormProvider {...methods}>
        <VStack space="lg">
          <ControlledInput
            label={t("name")}
            name="name"
            variant="underlined"
            placeholder="e.g Chicken rice"
          />
          <ControlledInput
            inputMode="decimal"
            placeholder="0.00"
            label={t("amount")}
            variant="underlined"
            name="amount"
          />
          <ControlledDropdown
            label={t("category")}
            name="category"
            variant="underlined"
            placeholder="Select a category"
            items={category?.map((category) => ({
              label: category.name || "",
              value: category.id.toString(),
            }))}
          />
          <ControlledRadio
            label={t("type")}
            name="type"
            variant="underlined"
            items={[
              { label: "Expense", value: "true" },
              { label: "Income", value: "false" },
            ]}
          />

          <ControlledDropdown
            label={t("spend.date")}
            name="spend_date"
            variant="underlined"
            placeholder="Select a date"
            isCalendar
          />
          <Button
            variant="solid"
            size="md"
            action="primary"
            className="mt-5 rounded-full gap-4"
            //   onPress={methods.handleSubmit(onSubmit)}
            //   disabled={isLoading || !methods.formState.isValid}
          >
            {isLoading && <ButtonSpinner color="gray" />}
            <ButtonText onPress={onSubmit}>
              {t(isLoading ? "add.loading" : "add")}
            </ButtonText>
          </Button>
        </VStack>
      </FormProvider>
    </Container>
  );
};

export default AddExpense;
