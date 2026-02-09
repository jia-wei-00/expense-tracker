import Container from "@/components/shared/Container";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
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
          placeholder="e.g Chicken rice"
        />
        <ControlledInput
          inputMode="decimal"
          placeholder="0.00"
          label={t("amount")}
          name="amount"
        />
        <ControlledDropdown label={t("type")} name="type" />
        <ControlledInput label={t("type")} name="type" />
        <ControlledInput label={t("spend.date")} name="spend_date" />

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
