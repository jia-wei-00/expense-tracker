import React, { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Container from "@/components/shared/Container";
import ActionSheet from "@/components/shared/ActionSheet";
import BudgetItem from "@/components/budget/BudgetItem";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Divider } from "@/components/ui/divider";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { useCategory } from "@/hooks/useCategory";
import {
  useAddBudget,
  useBudgets,
  useDeleteBudget,
  useUpdateBudget,
} from "@/hooks/useBudget";
import { useCurrencyStore } from "@/store/useCurrency";
import type { TBudgetWithCategory } from "@/types/hooks/use-budget";
import {
  createBudgetSchema,
  type TBudgetFormInput,
  type TBudgetFormOutput,
} from "@/types/page/budget-schema";

const OVERALL_CATEGORY = 0;

const Budget = () => {
  const { t } = useTranslation("budget");
  const symbol = useCurrencyStore((state) => state.symbol);
  const { data: budgets } = useBudgets();
  const { data: categories } = useCategory();
  const { mutateAsync: addBudget, isPending: isAdding } = useAddBudget();
  const { mutateAsync: updateBudget, isPending: isUpdating } =
    useUpdateBudget();
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();

  const [editing, setEditing] = useState<TBudgetWithCategory | null>(null);
  const [deleting, setDeleting] = useState<TBudgetWithCategory | null>(null);

  const isSaving = isAdding || isUpdating;

  const methods = useForm<TBudgetFormInput, unknown, TBudgetFormOutput>({
    resolver: zodResolver(createBudgetSchema(t)),
  });

  const categoryItems = useMemo(() => {
    const expenseCategories = (categories ?? []).filter(
      (category) => category.is_expense,
    );
    return [
      { label: t("overall"), value: String(OVERALL_CATEGORY) },
      ...expenseCategories.map((category) => ({
        label: category.name ?? "",
        value: category.id.toString(),
      })),
    ];
  }, [categories, t]);

  const categoryWatch = useWatch({
    control: methods.control,
    name: "category",
  });
  const displayValue = categoryItems.find(
    (item) => item.value === String(categoryWatch),
  )?.label;

  const startEdit = (budget: TBudgetWithCategory) => {
    setEditing(budget);
    methods.reset({
      category: budget.category ?? OVERALL_CATEGORY,
      amount: budget.amount,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    methods.reset({ category: undefined, amount: undefined });
  };

  const onSubmit = async (data: TBudgetFormOutput) => {
    const payload = {
      category: data.category === OVERALL_CATEGORY ? null : data.category,
      amount: data.amount,
    };
    if (editing) {
      await updateBudget({ id: editing.id, ...payload });
    } else {
      await addBudget(payload);
    }
    cancelEdit();
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteBudget(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <>
      <Container>
        <VStack space="md">
          <FormProvider {...methods}>
            <VStack
              space="lg"
              className="bg-background-0 p-5 rounded-2xl border border-outline-50 gap-2"
            >
              <ControlledDropdown
                label={t("category")}
                name="category"
                variant="underlined"
                placeholder={t("placeholder.category")}
                items={categoryItems}
                {...(displayValue && { displayValue })}
                valueType="number"
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
              {(budgets ?? []).length === 0 ? (
                <Text className="p-2">{t("empty")}</Text>
              ) : (
                (budgets ?? []).map((budget, index) => (
                  <React.Fragment key={budget.id}>
                    {index > 0 && <Divider className="my-2" />}
                    <BudgetItem
                      budget={budget}
                      onEdit={startEdit}
                      onDelete={setDeleting}
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
        description={t("delete.description", {
          name: deleting?.expense_category?.name ?? t("overall"),
        })}
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

export default Budget;
