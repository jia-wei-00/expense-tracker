import { TExpenseFilters } from "@/types/hooks/use-expense";

export interface IHistoryFilters {
  filters: TExpenseFilters;
  onChange: (filters: TExpenseFilters) => void;
}
