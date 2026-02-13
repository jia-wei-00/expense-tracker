import type { Database } from "@/database.types";

export type TExpense = Database["public"]["Tables"]["expense"]["Row"];

interface IExpense extends TExpense {
  category: string | null;
}

export interface IExpensesStore {
  expenses: IExpense[] | null;
  isFetching: boolean;
  setExpenses: (expenses: IExpense[]) => void;
  getExpenses: () => Promise<void>;
  getExpenseById: (id: number) => Promise<IExpense | undefined>;
  addExpense: (expense: TExpense) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}
