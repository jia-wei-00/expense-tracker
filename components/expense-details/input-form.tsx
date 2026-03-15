import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import ControlledRadio from "@/components/shared/ControlledRadio";
import { VStack } from "@/components/ui/vstack";
import { useCategory } from "@/hooks/useCategory";
import { TExpenseFormProps } from "@/types/components/expense-detail/input-form";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";

const ExpenseForm = ({ isExpense, children }: TExpenseFormProps) => {
  const { t } = useTranslation("details");
  const { data: category } = useCategory();
  const { watch } = useFormContext();

  const filteredCategory = useMemo(() => {
    return category?.filter((category) => {
      return category.is_expense === isExpense;
    });
  }, [category, isExpense]);

  const displayValue = useMemo(() => {
    return filteredCategory?.find((category) => {
      return category.id === watch("category");
    })?.name;
  }, [filteredCategory, watch("category")]);

  return (
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
        valueType="number"
        variant="underlined"
        name="amount"
        prefix="RM"
      />
      <ControlledRadio
        label={t("type")}
        name="is_expense"
        variant="underlined"
        valueType="boolean"
        items={[
          { label: t("expense"), value: true },
          { label: t("income"), value: false },
        ]}
      />
      <ControlledDropdown
        label={t("category")}
        name="category"
        variant="underlined"
        placeholder="Select a category"
        items={filteredCategory?.map((category) => ({
          label: category.name || "",
          value: category.id.toString(),
        }))}
        {...(displayValue && { displayValue })}
        valueType="number"
      />
      <ControlledDropdown
        label={t("spend.date")}
        name="spend_date"
        variant="underlined"
        placeholder="Select a date"
        isCalendar
      />
      {children}
    </VStack>
  );
};

export default ExpenseForm;
