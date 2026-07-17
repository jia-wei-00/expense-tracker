import React, { useMemo } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useBudgets } from "@/hooks/useBudget";
import { useFetchMonthlyExpenses } from "@/hooks/useExpenses";
import { useCurrencyStore } from "@/store/useCurrency";
import { cn } from "@/lib/utils";
import { IBudgetProgress } from "@/types/components/home/budget-progress";

const progressColor = (spent: number, limit: number) => {
  if (spent >= limit) return "bg-error-500";
  if (spent >= limit * 0.8) return "bg-warning-500";
  return "bg-success-500";
};

const BudgetProgress = ({ month }: IBudgetProgress) => {
  const { t } = useTranslation("home");
  const symbol = useCurrencyStore((state) => state.symbol);
  const { data: budgets } = useBudgets();
  const { data: monthly } = useFetchMonthlyExpenses(month);

  const { perCategory, overall } = useMemo(() => {
    const perCategory: Record<string, number> = {};
    let overall = 0;
    for (const entry of monthly?.expense ?? []) {
      const category = Object.keys(entry)[0];
      const amount = entry[category];
      perCategory[category] = (perCategory[category] ?? 0) + amount;
      overall += amount;
    }
    return { perCategory, overall };
  }, [monthly]);

  const handleManage = () => router.push("/budget");

  return (
    <VStack className="py-2.5 flex-1">
      <VStack className="p-5 rounded-2xl bg-background-0" space="md">
        <HStack className="items-center justify-between">
          <Text bold size="lg">
            {t("budget.title")}
          </Text>
          <Button variant="link" size="sm" onPress={handleManage}>
            <ButtonText>{t("budget.manage")}</ButtonText>
          </Button>
        </HStack>
        {(budgets ?? []).length === 0 ? (
          <Text>{t("budget.empty")}</Text>
        ) : (
          (budgets ?? []).map((budget) => {
            const name = budget.expense_category?.name;
            const spent = name ? (perCategory[name] ?? 0) : overall;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            return (
              <VStack key={budget.id} space="xs">
                <HStack className="items-center justify-between">
                  <Text size="sm" numberOfLines={1} className="flex-1">
                    {name ?? t("budget.overall")}
                  </Text>
                  <Text size="sm" className="text-typography-500">
                    {t("budget.spent", {
                      currency: symbol,
                      spent: spent.toFixed(2),
                      total: budget.amount,
                    })}
                  </Text>
                </HStack>
                <Box className="h-2 rounded-full bg-background-100 overflow-hidden">
                  <Box
                    className={cn(
                      "h-2 rounded-full",
                      progressColor(spent, budget.amount),
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </Box>
              </VStack>
            );
          })
        )}
      </VStack>
    </VStack>
  );
};

export default BudgetProgress;
