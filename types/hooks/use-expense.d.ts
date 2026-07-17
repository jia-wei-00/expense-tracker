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

export type TExpenseTypeFilter = "all" | "expense" | "income";

export type TExpenseFilters = {
  search?: string;
  type?: TExpenseTypeFilter;
  startDate?: string;
  endDate?: string;
};

export type TTrendPoint = {
  month: string;
  expense: number;
  income: number;
};
