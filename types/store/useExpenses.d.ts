import type { Database } from "@/database.types";

export type TExpense = Database["public"]["Tables"]["expense"]["Row"];
export type TAddExpense = Database["public"]["Tables"]["expense"]["Insert"];

interface IExpense extends TExpense {
  category: string | null;
}

export interface IExpensesStore {
  expenses: IExpense[] | null;
  isFetching: boolean;
  setExpenses: (expenses: IExpense[]) => void;
  getExpenses: () => Promise<void>;
  getExpenseById: (id: number) => Promise<IExpense | undefined>;
  addExpense: (expense: TAddExpense) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}
