export interface TExpenseFormProps {
  /**
   * isExpense should be pass in for determine the type of expense to filter category available
   */
  isExpense: boolean;
  children: React.ReactNode;
}
