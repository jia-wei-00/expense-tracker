import ControlledDropdown from "@/components/shared/ControlledDropdown";
import ControlledInput from "@/components/shared/ControlledInput";
import ControlledRadio from "@/components/shared/ControlledRadio";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createAddExpenseSchema,
  TAddExpenseInput,
  TAddExpenseOutput,
} from "@/types/page/add-schema";
import { IPendingActionPanel } from "@/types/components/agent/pending-action-panel";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const PendingActionPanel = ({
  pendingToolCall,
  categories,
  onConfirm,
  onCancel,
}: IPendingActionPanel) => {
  const { t } = useTranslation("agent");
  const { t: tDetails } = useTranslation("details");
  const { t: tCommon } = useTranslation("common");
  const { toolName, args } = pendingToolCall;

  const schema = createAddExpenseSchema(tDetails);

  const methods = useForm<TAddExpenseInput, unknown, TAddExpenseOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: args.name ?? "",
      amount: args.amount ?? 0,
      category: args.category ?? 0,
      is_expense: args.is_expense ?? true,
      spend_date: args.spend_date ?? new Date().toISOString(),
    },
  });

  const watchedIsExpense = useWatch({ control: methods.control, name: "is_expense" });

  const filteredCategories = useMemo(
    () => categories?.filter((c) => c.is_expense === watchedIsExpense),
    [categories, watchedIsExpense],
  );

  const displayValue = useMemo(() => {
    const watchedCategory = methods.getValues("category");
    return filteredCategories?.find((c) => c.id === watchedCategory)?.name;
  }, [filteredCategories, methods]);

  const handleApprove = methods.handleSubmit((data) => {
    onConfirm({
      name: data.name,
      amount: data.amount,
      category: data.category,
      is_expense: data.is_expense,
      spend_date: data.spend_date,
    });
  });

  return (
    <Box className="border border-outline-200 rounded-xl p-3 mb-2 bg-background-100">
      <Text className="text-xs text-typography-500 mb-3">
        {t("pending.title")}
      </Text>

      {toolName === "addExpense" && (
        <FormProvider {...methods}>
          <VStack space="sm" className="mb-3">
            <ControlledInput
              label={tDetails("name")}
              name="name"
              variant="underlined"
              placeholder={tDetails("placeholder.name")}
            />
            <ControlledInput
              label={tDetails("amount")}
              name="amount"
              variant="underlined"
              inputMode="decimal"
              placeholder={tDetails("placeholder.amount")}
              valueType="number"
              prefix={tCommon("currency.prefix")}
            />
            <ControlledRadio
              label={tDetails("type")}
              name="is_expense"
              valueType="boolean"
              items={[
                { label: tDetails("expense"), value: true },
                { label: tDetails("income"), value: false },
              ]}
            />
            <ControlledDropdown
              label={tDetails("category")}
              name="category"
              variant="underlined"
              placeholder={tDetails("placeholder.category")}
              items={filteredCategories?.map((c) => ({
                label: c.name ?? "",
                value: c.id.toString(),
              }))}
              {...(displayValue && { displayValue })}
              valueType="number"
            />
            <ControlledDropdown
              label={tDetails("spend.date")}
              name="spend_date"
              variant="underlined"
              placeholder={tDetails("placeholder.date")}
              isCalendar
            />
          </VStack>
        </FormProvider>
      )}

      {toolName === "deleteExpense" && (
        <Text className="text-sm text-typography-900 mb-3">
          {t("pending.delete")}
        </Text>
      )}

      <HStack space="sm">
        <Button variant="outline" size="sm" onPress={onCancel} className="flex-1">
          <ButtonText>{t("cancel")}</ButtonText>
        </Button>
        <Button
          size="sm"
          onPress={toolName === "addExpense" ? handleApprove : () => onConfirm(args)}
          className="flex-1"
        >
          <ButtonText>{t("confirm")}</ButtonText>
        </Button>
      </HStack>
    </Box>
  );
};

export default PendingActionPanel;
