import React from "react";
import { useTranslation } from "react-i18next";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useCurrencyStore } from "@/store/useCurrency";
import type { ILoanStats } from "@/types/components/loan/loan-stats";

const StatBox = ({
  label,
  value,
  className,
  textClassName,
}: {
  label: string;
  value: string;
  className: string;
  textClassName: string;
}) => (
  <VStack className={`flex-1 items-center rounded-xl p-2 ${className}`}>
    <Text size="xs" className="text-typography-500">
      {label}
    </Text>
    <Text size="sm" className={`font-medium ${textClassName}`}>
      {value}
    </Text>
  </VStack>
);

const LoanStats = ({ totalAmount, paidAmount, remainingAmount }: ILoanStats) => {
  const { t } = useTranslation("loan");
  const prefix = useCurrencyStore((state) => state.symbol);

  return (
    <HStack space="md">
      <StatBox
        label={t("total")}
        value={`${prefix}${totalAmount.toFixed(2)}`}
        className="bg-background-100"
        textClassName=""
      />
      <StatBox
        label={t("paid.amount")}
        value={`${prefix}${paidAmount.toFixed(2)}`}
        className="bg-success-50"
        textClassName="text-success-700"
      />
      <StatBox
        label={t("remaining")}
        value={`${prefix}${remainingAmount.toFixed(2)}`}
        className="bg-warning-50"
        textClassName="text-warning-700"
      />
    </HStack>
  );
};

export default LoanStats;
