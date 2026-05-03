import type { TPendingToolCall } from "@/types/hooks/use-agent";
import type { TCategory } from "@/types/store/useCategory";

export interface IPendingActionPanel {
  pendingToolCall: TPendingToolCall;
  categories: TCategory[] | undefined;
  onConfirm: () => void;
  onCancel: () => void;
}
