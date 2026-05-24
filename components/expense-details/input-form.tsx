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
  const { t: tCommon } = useTranslation("common");
  const { data: category } = useCategory();
  const { watch } = useFormContext();

  const filteredCategory = useMemo(() => {
    return category?.filter((category) => {
      return category.is_expense === isExpense;
    });
  }, [category, isExpense]);

  const categoryWatch = watch("category");
  const displayValue = useMemo(() => {
    return filteredCategory?.find((category) => category.id === categoryWatch)
      ?.name;
  }, [filteredCategory, categoryWatch]);

  return (
    <VStack
      space="lg"
      className="bg-background-0 p-5 rounded-2xl border border-outline-50 gap-2"
    >
      <ControlledInput
        label={t("name")}
        name="name"
        variant="underlined"
        placeholder={t("placeholder.name")}
      />
      <ControlledInput
        inputMode="decimal"
        placeholder={t("placeholder.amount")}
        label={t("amount")}
        valueType="number"
        variant="underlined"
        name="amount"
        prefix={tCommon("currency.prefix")}
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
        placeholder={t("placeholder.category")}
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
        placeholder={t("placeholder.date")}
        isCalendar
      />
      {children}
    </VStack>
  );
};

export default ExpenseForm;
