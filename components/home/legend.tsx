import React from "react";
import { Text } from "@/components/ui/text";
import Badge from "@/components/shared/Badge";
import { ILegend } from "@/types/components/home/legend";
import { HStack } from "@/components/ui/hstack";
import { useTranslation } from "react-i18next";

const Legend = ({ pieData, totalExpense }: ILegend) => {
  const { t } = useTranslation("home");

  return (
    <HStack space="lg" className="flex-wrap">
      {pieData.map((item, index) => {
        const percentage =
          totalExpense > 0
            ? ((item.value / totalExpense) * 100).toFixed(0)
            : "0";
        return (
          <HStack key={index} space="sm" className="items-center">
            <Badge className={item.colorClass} />
            <Text numberOfLines={1}>
              {t("chart.legend.item", {
                label: item.label,
                amount: item.value,
                percentage,
              })}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
};

export default Legend;
