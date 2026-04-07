import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { IExpense } from "@/types/store/useExpenses";
import { barDataItem } from "react-native-gifted-charts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWeeklyBarData = (expenses: IExpense[]): barDataItem[] => {
  const weeks: IExpense[][] = [[], [], [], []];

  expenses.forEach((expense) => {
    const day = dayjs(expense.spend_date).date();
    const weekIndex = Math.min(Math.ceil(day / 7), 4) - 1;
    weeks[weekIndex].push(expense);
  });

  const mappedData = weeks.flatMap((weekExpenses, i) => {
    const expenseTotal = weekExpenses
      .filter((e) => e.is_expense !== false)
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const incomeTotal = weekExpenses
      .filter((e) => e.is_expense === false)
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);

    return [
      {
        value: expenseTotal,
        label: `${i * 7 + 1}`,
        spacing: 2,
        frontColor: "#ef4444", // Red for expenses
        barBorderRadius: 4,
      },
      {
        value: incomeTotal + 1,
        frontColor: "#22c55e", // Green for income
        barBorderRadius: 4,
      },
    ];
  });

  return mappedData;
};
