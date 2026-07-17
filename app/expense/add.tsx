import ExpenseForm from "@/components/expense-details/input-form";
import Container from "@/components/shared/Container";
import ActionSheet from "@/components/shared/ActionSheet";
import { Button, ButtonSpinner, ButtonText, ButtonIcon } from "@/components/ui/button";
import { useAddExpense } from "@/hooks/useExpenses";
import { useReceiptScan } from "@/hooks/useReceiptScan";
import {
  createAddExpenseSchema,
  type TAddExpenseInput,
  type TAddExpenseOutput,
} from "@/types/page/add-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScanLine } from "lucide-react-native";

const AddExpense = () => {
  const { t } = useTranslation("details");
  const { mutateAsync: addExpense, isPending: isLoading } = useAddExpense();
  const { scanReceipt, isScanning } = useReceiptScan();
  const [isSourceOpen, setIsSourceOpen] = useState(false);

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

  const isExpenseWatch = useWatch({
    control: methods.control,
    name: "is_expense",
  });
  const { resetField } = methods;

  useEffect(() => {
    resetField("category");
  }, [isExpenseWatch, resetField]);

  const handleScan = async (source: "gallery" | "camera") => {
    setIsSourceOpen(false);
    const result = await scanReceipt(source);
    if (!result) return;
    methods.reset({
      name: result.name,
      amount: result.amount,
      category: result.category,
      is_expense: result.is_expense ?? true,
      spend_date: result.spend_date ?? dayjs().toISOString(),
    });
  };

  return (
    <Container>
      <Button
        variant="outline"
        size="md"
        className="mb-4 rounded-full gap-2"
        onPress={() => setIsSourceOpen(true)}
        isDisabled={isScanning}
      >
        {isScanning ? <ButtonSpinner /> : <ButtonIcon as={ScanLine} />}
        <ButtonText>{t(isScanning ? "scan.loading" : "scan")}</ButtonText>
      </Button>
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
      <ActionSheet
        title={t("scan.source.title")}
        description={t("scan.source.description")}
        isOpen={isSourceOpen}
        onClose={() => setIsSourceOpen(false)}
        primaryButtonLabel={t("scan.source.camera")}
        primaryButtonAction={() => handleScan("camera")}
        secondaryButtonLabel={t("scan.source.gallery")}
        secondaryButtonAction={() => handleScan("gallery")}
      />
    </Container>
  );
};

export default AddExpense;
