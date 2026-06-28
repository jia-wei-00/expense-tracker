export type TPushExpenseItem = {
  name: string;
  amount: number;
  // Expense row id — when present, the summary row deep-links to its details.
  id?: number;
};

// Payload carried in a push notification's `data` field for expense events
// sent from the WhatsApp backend.
export type TExpensePushPayload = {
  type: "EXPENSE_ADDED" | "EXPENSE_UPDATED";
  expenses: TPushExpenseItem[];
  count?: number;
  totalAmount?: number;
  currency?: string;
};
