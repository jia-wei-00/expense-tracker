export type Category = {
  id: number;
  name: string;
  is_expense: boolean;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type PendingToolCall = {
  toolName: "addExpense" | "deleteExpense";
  args: {
    // addExpense
    name?: string;
    amount?: number;
    category?: number;
    is_expense?: boolean;
    spend_date?: string;
    // deleteExpense
    id?: number;
  };
};
