import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { BarChart } from "react-native-gifted-charts";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import Badge from "@/components/shared/Badge";
import { useFetchExpenseTrends } from "@/hooks/useExpenses";
import { ITrendsChart } from "@/types/components/home/trends-chart";

const EXPENSE_COLOR = "#ef4444";
const INCOME_COLOR = "#22c55e";

const TrendsChart = ({ months = 6 }: ITrendsChart) => {
  const { t } = useTranslation("home");
  const { data: trends } = useFetchExpenseTrends(months);
  const { colorScheme } = useColorScheme();
  const axisTextColor =
    colorScheme === "dark" ? "rgb(140,140,140)" : "rgb(115,115,115)";

  const { barData, hasData } = useMemo(() => {
    const points = trends ?? [];
    const mapped = points.flatMap((point) => [
      {
        value: point.expense,
        label: dayjs(point.month).format("MMM"),
        spacing: 2,
        frontColor: EXPENSE_COLOR,
        barBorderRadius: 4,
      },
      {
        value: point.income,
        frontColor: INCOME_COLOR,
        barBorderRadius: 4,
      },
    ]);
    return {
      barData: mapped,
      hasData: points.some((point) => point.expense > 0 || point.income > 0),
    };
  }, [trends]);

  return (
    <VStack className="py-2.5 flex-1">
      <VStack className="p-5 rounded-2xl bg-background-0" space="md">
        <Text bold size="lg">
          {t("chart.trends.title")}
        </Text>
        {hasData ? (
          <>
            <BarChart
              data={barData}
              barWidth={10}
              spacing={16}
              noOfSections={4}
              rulesColor={axisTextColor}
              rulesThickness={0.2}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: axisTextColor, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: axisTextColor, fontSize: 10 }}
              disableScroll
            />
            <HStack space="lg">
              <HStack space="sm" className="items-center">
                <Badge className="bg-[#ef4444]" />
                <Text size="sm">{t("chart.trends.expense")}</Text>
              </HStack>
              <HStack space="sm" className="items-center">
                <Badge className="bg-[#22c55e]" />
                <Text size="sm">{t("chart.trends.income")}</Text>
              </HStack>
            </HStack>
          </>
        ) : (
          <Center className="py-5">
            <Text>{t("chart.empty")}</Text>
          </Center>
        )}
      </VStack>
    </VStack>
  );
};

export default TrendsChart;
