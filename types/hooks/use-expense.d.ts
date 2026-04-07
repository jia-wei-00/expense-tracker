export type TExpenseCategory = {
  name: string;
};

export type TExpenseRow = {
  amount: number;
  is_expense: boolean;
  expense_category: TExpenseCategory;
};

export type TMonthlySummary = {
  expense: Record<string, number>[];
  income: Record<string, number>[];
};
