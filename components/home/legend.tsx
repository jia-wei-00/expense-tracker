import React from "react";
import { Text } from "@/components/ui/text";
import Badge from "@/components/shared/Badge";
import { ILegend } from "@/types/components/home/legend";
import { HStack } from "@/components/ui/hstack";

const Legend = ({ pieData, totalExpense }: ILegend) => {
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
              {item.label}: {percentage}%
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
};

export default Legend;
