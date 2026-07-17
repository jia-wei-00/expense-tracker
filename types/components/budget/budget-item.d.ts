import { TBudgetWithCategory } from "@/types/hooks/use-budget";

export interface IBudgetItem {
  budget: TBudgetWithCategory;
  onEdit: (budget: TBudgetWithCategory) => void;
  onDelete: (budget: TBudgetWithCategory) => void;
}
