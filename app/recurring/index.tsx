import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Container from "@/components/shared/Container";
import ActionSheet from "@/components/shared/ActionSheet";
import RecurringItem from "@/components/recurring/RecurringItem";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import ControlledRadio from "@/components/shared/ControlledRadio";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Divider } from "@/components/ui/divider";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useCategory } from "@/hooks/useCategory";
import {
  useAddRecurring,
  useDeleteRecurring,
  useRecurringExpenses,
  useUpdateRecurring,
} from "@/hooks/useRecurring";
import { useCurrencyStore } from "@/store/useCurrency";
import type { TRecurringWithCategory } from "@/types/hooks/use-recurring";
import {
  createRecurringSchema,
  type TRecurringFormInput,
  type TRecurringFormOutput,
} from "@/types/page/recurring-schema";

const DAY_ITEMS = Array.from({ length: 28 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

const Recurring = () => {
  const { t } = useTranslation("recurring");
  const symbol = useCurrencyStore((state) => state.symbol);
  const { data: recurringExpenses } = useRecurringExpenses();
  const { data: categories } = useCategory();
  const { mutateAsync: addRecurring, isPending: isAdding } = useAddRecurring();
  const { mutateAsync: updateRecurring, isPending: isUpdating } =
    useUpdateRecurring();
  const { mutate: toggleRecurring } = useUpdateRecurring();
  const { mutate: deleteRecurring, isPending: isDeleting } =
    useDeleteRecurring();

  const [editing, setEditing] = useState<TRecurringWithCategory | null>(null);
  const [deleting, setDeleting] = useState<TRecurringWithCategory | null>(
    null,
  );

  const isSaving = isAdding || isUpdating;

  const methods = useForm<TRecurringFormInput, unknown, TRecurringFormOutput>({
    resolver: zodResolver(createRecurringSchema(t)),
    defaultValues: { is_expense: true },
  });

  const isExpenseWatch = useWatch({
    control: methods.control,
    name: "is_expense",
  });
  const { resetField } = methods;

  useEffect(() => {
    if (!editing) resetField("category");
  }, [isExpenseWatch, resetField, editing]);

  const categoryItems = useMemo(() => {
    return (categories ?? [])
      .filter((category) => category.is_expense === isExpenseWatch)
      .map((category) => ({
        label: category.name ?? "",
        value: category.id.toString(),
      }));
  }, [categories, isExpenseWatch]);

  const categoryWatch = useWatch({
    control: methods.control,
    name: "category",
  });
  const displayValue = categoryItems.find(
    (item) => item.value === String(categoryWatch),
  )?.label;

  const dayWatch = useWatch({
    control: methods.control,
    name: "day_of_month",
  });
  const dayDisplayValue = dayWatch ? String(dayWatch) : undefined;

  const startEdit = (recurring: TRecurringWithCategory) => {
    setEditing(recurring);
    methods.reset({
      name: recurring.name,
      amount: recurring.amount,
      category: recurring.category,
      is_expense: recurring.is_expense,
      day_of_month: recurring.day_of_month,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    methods.reset({ is_expense: true });
  };

  const onSubmit = async (data: TRecurringFormOutput) => {
    if (editing) {
      await updateRecurring({ id: editing.id, ...data });
    } else {
      await addRecurring(data);
    }
    cancelEdit();
  };

  const handleToggleActive = (recurring: TRecurringWithCategory) => {
    toggleRecurring({ id: recurring.id, is_active: !recurring.is_active });
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteRecurring(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <>
      <Container>
        <VStack space="md">
          <Text size="sm" className="text-typography-500">
            {t("hint")}
          </Text>
          <FormProvider {...methods}>
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
                prefix={symbol}
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
                items={categoryItems}
                {...(displayValue && { displayValue })}
                valueType="number"
              />
              <ControlledDropdown
                label={t("day")}
                name="day_of_month"
                variant="underlined"
                placeholder={t("placeholder.day")}
                items={DAY_ITEMS}
                {...(dayDisplayValue && { displayValue: dayDisplayValue })}
                valueType="number"
                scrollable
              />
              <Button
                variant="solid"
                size="md"
                action="primary"
                className="mt-5 rounded-full gap-4"
                onPress={methods.handleSubmit(onSubmit)}
              >
                {isSaving && <ButtonSpinner color="gray" />}
                <ButtonText>
                  {t(isSaving ? "saving" : editing ? "update" : "add")}
                </ButtonText>
              </Button>
              {editing && (
                <Button variant="link" size="sm" onPress={cancelEdit}>
                  <ButtonText>{t("cancel.edit")}</ButtonText>
                </Button>
              )}
            </VStack>
          </FormProvider>

          <VStack space="sm">
            <Text size="lg" bold>
              {t("list.title")}
            </Text>
            <VStack className="bg-background-0 p-3 rounded-2xl border border-outline-50">
              {(recurringExpenses ?? []).length === 0 ? (
                <Text className="p-2">{t("empty")}</Text>
              ) : (
                (recurringExpenses ?? []).map((recurring, index) => (
                  <React.Fragment key={recurring.id}>
                    {index > 0 && <Divider className="my-2" />}
                    <RecurringItem
                      recurring={recurring}
                      onEdit={startEdit}
                      onDelete={setDeleting}
                      onToggleActive={handleToggleActive}
                    />
                  </React.Fragment>
                ))
              )}
            </VStack>
          </VStack>
        </VStack>
      </Container>

      <ActionSheet
        title={t("delete.title")}
        description={t("delete.description", { name: deleting?.name ?? "" })}
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        isLoading={isDeleting}
        primaryButtonLabel={t(isDeleting ? "deleting" : "delete")}
        primaryButtonAction={handleDelete}
        secondaryButtonLabel={t("cancel")}
        secondaryButtonAction={() => setDeleting(null)}
      />
    </>
  );
};

export default Recurring;
