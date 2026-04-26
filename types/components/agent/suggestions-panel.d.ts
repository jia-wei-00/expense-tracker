import type { ParsedExpense } from "@/types/page/agent";

export interface ISuggestionsPanel {
  suggestions: ParsedExpense[];
  isSubmitting: boolean;
  onApproveAll: () => void;
  onClear: () => void;
  onUpdate: (index: number, updated: ParsedExpense) => void;
  onRemove: (index: number) => void;
}
