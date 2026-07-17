import type { Database } from "@/database.types";

export type TBudget = Database["public"]["Tables"]["budget"]["Row"];

export type TBudgetWithCategory = TBudget & {
  expense_category: { name: string | null } | null;
};

export type TAddBudget = {
  category: number | null;
  amount: number;
};

export type TUpdateBudget = TAddBudget & {
  id: number;
};
