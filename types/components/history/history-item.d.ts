import type { IExpense } from "@/types/store/useExpenses";

export interface IHistoryItem {
  item: IExpense;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
}
