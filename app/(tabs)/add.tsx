import Container from "@/components/shared/Container";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/store/useCategory";
import { addExpenseSchema, TAddExpense } from "@/types/page/add-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const AddExpense = () => {
  const { t } = useTranslation("add");
  const category = useCategoryStore((state) => state.category);

  const methods = useForm<TAddExpense>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      is_expense: true,
      spend_date: new Date(),
    },
  });

  return (
    <Container title={t("add.expense")}>
      <FormProvider {...methods}>
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
        <ControlledInput label={t("type")} name="type" variant="underlined" />
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
          {/* {isLoading && <ButtonSpinner color="gray" />} */}
          {/* <ButtonText>{t(isLoading ? "login.loading" : "login")}</ButtonText> */}
        </Button>
      </FormProvider>
    </Container>
  );
};

export default AddExpense;
