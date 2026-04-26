export interface ParsedExpense {
  name: string;
  amount: number;
  is_expense: boolean;
  spend_date: string;
  category_name: string;
  category_id: number | null;
  is_new_category: boolean;
}

export type TChatMessageRole = "user" | "assistant";

export interface TChatMessage {
  id: string;
  role: TChatMessageRole;
  content: string;
  suggestions?: ParsedExpense[];
  isLoading?: boolean;
}
