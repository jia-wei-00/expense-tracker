import type { Database } from "@/database.types";

export type TRecurringExpense =
  Database["public"]["Tables"]["recurring_expense"]["Row"];

export type TRecurringWithCategory = TRecurringExpense & {
  expense_category: { name: string | null } | null;
};

export type TAddRecurring = {
  name: string;
  amount: number;
  category: number;
  is_expense: boolean;
  day_of_month: number;
};

export type TUpdateRecurring = Partial<TAddRecurring> & {
  id: number;
  is_active?: boolean;
};
