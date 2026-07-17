import { useFetchMonthlyExpenses } from "@/hooks/useExpenses";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useColorScheme } from "nativewind";
import { Text } from "@/components/ui/text";
import { PieChart } from "react-native-gifted-charts";
import Legend from "@/components/home/legend";
import CategoryFilter from "@/components/home/CategoryFilter";
import { CHART_COLORS } from "@/types/constant/chart-color";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { IChart } from "@/types/components/home/chart";
import { useTranslation } from "react-i18next";
import { useCurrencyStore } from "@/store/useCurrency";

const Chart = ({ type, month }: IChart) => {
  const { data } = useFetchMonthlyExpenses(month);
  const { t } = useTranslation("home");
  const symbol = useCurrencyStore((state) => state.symbol);
  const { colorScheme } = useColorScheme();
  // PieChart fakes the donut hole with a solid filled circle — must match the card's bg-background-0
  const innerCircleColor =
    colorScheme === "dark" ? "rgb(18, 18, 18)" : "rgb(255, 255, 255)";
  const [excluded, setExcluded] = useState<string[]>([]);

  // Reset the filter when the selected month changes (adjust-state-during-render pattern)
  const monthKey = dayjs(month).format("YYYY-MM");
  const [prevMonthKey, setPrevMonthKey] = useState(monthKey);
  if (prevMonthKey !== monthKey) {
    setPrevMonthKey(monthKey);
    setExcluded([]);
  }

  const allPieData = useMemo(() => {
    if (!data?.[type]) return [];

    const expensesByCategory = data[type].reduce<Record<string, number>>(
      (acc, curr) => {
        const category = Object.keys(curr)[0];
        const amount = curr[category];
        acc[category] = (acc[category] ?? 0) + amount;
        return acc;
      },
      {},
    );

    const mapped = Object.entries(expensesByCategory).map(
      ([category, amount], index) => {
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

    return mapped;
  }, [data, type]);

  const { pieData, total } = useMemo(() => {
    const filtered = allPieData
      .filter((item) => !excluded.includes(item.label))
      .map((item, index) => ({ ...item, focused: index === 0 }));
    const filteredTotal = filtered.reduce((acc, item) => acc + item.value, 0);
    return { pieData: filtered, total: filteredTotal };
  }, [allPieData, excluded]);

  const handleToggle = (label: string) => {
    setExcluded((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const title = t(
    type === "expense" ? "chart.expense.title" : "chart.income.title",
  );

  if (allPieData.length === 0) {
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
        <CategoryFilter
          categories={allPieData}
          excluded={excluded}
          onToggle={handleToggle}
        />
        {pieData.length === 0 ? (
          <Center className="py-5">
            <Text>{t("chart.empty")}</Text>
          </Center>
        ) : (
          <>
            <Text bold size="lg">
              {t("chart.total", { total, currency: symbol })}
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
                    total > 0
                      ? ((maxItem.value / total) * 100).toFixed(0)
                      : "0";
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
          </>
        )}
      </VStack>
    </VStack>
  );
};

export default Chart;
