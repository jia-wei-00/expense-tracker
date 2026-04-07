import { useFetchMonthlyExpenses } from "@/hooks/useExpenses";
import dayjs from "dayjs";
import { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { getWeeklyBarData } from "@/lib/utils";
import Legend from "@/components/home/legend";

const Chart = () => {
  const { data } = useFetchMonthlyExpenses(dayjs().toDate());

  const daysInMonth = dayjs().daysInMonth();
  const dailyTotals = Array.from({ length: daysInMonth }, () => 0);

  const { width } = useWindowDimensions();

  //   const barData = useMemo(() => {

  //   }, [data]);

  return (
    <View>
      <Text>Spend</Text>
      {/* <Text>RM {data?.reduce((sum, e) => sum + (e.amount ?? 0), 0)}</Text> */}
      <Legend
        data={[
          { color: "red", label: "Expense" },
          { color: "green", label: "Income" },
        ]}
      />
      <LineChart
        data={[
          { value: 15, label: "W1" },
          { value: 30, label: "W2" },
          { value: 26, label: "W3" },
          { value: 40, label: "W4" },
        ]}
        secondaryData={[
          { value: 10 },
          { value: 20 },
          { value: 30 },
          { value: 40 },
        ]}
        noOfSections={3}
        yAxisTextStyle={{ color: "gray" }}
        xAxisLabelTextStyle={{ color: "gray" }}
        color="red"
        dataPointsColor="white"
        secondaryLineConfig={{ color: "green" }}
        width={width}
      />
    </View>
  );
};

export default Chart;
