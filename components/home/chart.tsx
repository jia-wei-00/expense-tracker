import { useFetchMonthlyExpenses } from "@/hooks/useExpenses";
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { Text } from "@/components/ui/text";
import { PieChart } from "react-native-gifted-charts";
import Legend from "@/components/home/legend";
import { CHART_COLORS } from "@/types/constant/chart-color";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { IChart } from "@/types/components/home/chart";
import { useTranslation } from "react-i18next";

const Chart = ({ type, month }: IChart) => {
  const { data } = useFetchMonthlyExpenses(month);
  const { t } = useTranslation("home");
  const colorScheme = useColorScheme();
  // PieChart fakes the donut hole with a solid filled circle — must match the card's bg-background-0
  const innerCircleColor = colorScheme === "dark" ? "rgb(18, 18, 18)" : "rgb(255, 255, 255)";

  const { pieData, total } = useMemo(() => {
    if (!data?.[type]) return { pieData: [], total: 0 };

    const expensesByCategory = data[type].reduce<Record<string, number>>(
      (acc, curr) => {
        const category = Object.keys(curr)[0];
        const amount = curr[category];
        acc[category] = (acc[category] ?? 0) + amount;
        return acc;
      },
      {},
    );

    let runningTotal = 0;
    const mapped = Object.entries(expensesByCategory).map(
      ([category, amount], index) => {
        runningTotal += amount;
        const colorScheme = CHART_COLORS[index % CHART_COLORS.length];
        return {
          value: amount,
          label: category,
          color: colorScheme.color,
          gradientCenterColor: colorScheme.gradientCenterColor,
          colorClass: colorScheme.colorClass,
          focused: false,
        };
      },
    );

    mapped.sort((a, b) => b.value - a.value);

    if (mapped.length > 0) {
      mapped[0].focused = true;
    }

    return { pieData: mapped, total: runningTotal };
  }, [data, type]);

  const title = t(
    type === "expense" ? "chart.expense.title" : "chart.income.title",
  );

  if (!pieData || pieData.length === 0) {
    return (
      <VStack className="py-2.5 flex-1">
        <VStack className="p-5 rounded-2xl bg-background-0" space="md">
          <Text bold size="lg">
            {title}
          </Text>
          <Center className="py-5">
            <Text>{t("chart.empty")}</Text>
          </Center>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack className="py-2.5 flex-1">
      <VStack className="p-5 rounded-2xl bg-background-0" space="4xl">
        <Text bold size="lg">
          {title}
        </Text>
        <Text bold size="lg">
          {t("chart.total", { total })}
        </Text>
        <Center>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor={innerCircleColor}
            centerLabelComponent={() => {
              const maxItem = pieData[0];
              const percentage =
                total > 0 ? ((maxItem.value / total) * 100).toFixed(0) : "0";
              return (
                <Center>
                  <Text bold size="2xl">
                    {percentage}%
                  </Text>
                  <Text>{maxItem.label}</Text>
                </Center>
              );
            }}
          />
        </Center>
        <Legend pieData={pieData} totalExpense={total} />
      </VStack>
    </VStack>
  );
};

export default Chart;
