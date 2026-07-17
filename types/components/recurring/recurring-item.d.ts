import { TRecurringWithCategory } from "@/types/hooks/use-recurring";

export interface IRecurringItem {
  recurring: TRecurringWithCategory;
  onEdit: (recurring: TRecurringWithCategory) => void;
  onDelete: (recurring: TRecurringWithCategory) => void;
  onToggleActive: (recurring: TRecurringWithCategory) => void;
}
