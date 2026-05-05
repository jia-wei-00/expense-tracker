export type TMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TDisplayMessage = TMessage & { isLoading?: boolean };

export type TPendingToolCall = {
  toolName: "addExpense" | "deleteExpense";
  args: {
    // addExpense fields
    name?: string;
    amount?: number;
    category?: number;
    is_expense?: boolean;
    spend_date?: string;
    // deleteExpense fields
    id?: number;
  };
};

export type TAiChatResponse = {
  message: string;
  pendingToolCalls?: TPendingToolCall[];
};
