import type { ParsedExpense } from "@/types/page/agent";

export interface IExpenseSuggestionCard {
  suggestion: ParsedExpense;
  onChange: (updated: ParsedExpense) => void;
  onRemove: () => void;
}
