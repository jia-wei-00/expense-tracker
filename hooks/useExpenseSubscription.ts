import { supabase } from "@/lib/supabase";
import { useCategoryStore } from "@/store/useCategory";
import { useExpensesStore } from "@/store/useExpenses";
import { useSessionStore } from "@/store/useSession";
import { TExpense } from "@/types/store/useExpenses";
import { useEffect } from "react";

export const useExpenseSubscription = () => {
  const userId = useSessionStore.getState().getUserId();
  const expenses = useExpensesStore((state) => state.expenses);
  const setExpenses = useExpensesStore((state) => state.setExpenses);
  const category = useCategoryStore((state) => state.category);
  const getCategoryNameById = useCategoryStore(
    (state) => state.getCategoryNameById,
  );

  useEffect(() => {
    if (!category) useCategoryStore.getState().getCategory();
  }, [category]);

  const subscribeToExpense = supabase.channel(userId + "_expense").on<TExpense>(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "expense",
    },
    (payload) => {
      const { eventType, new: expense, old } = payload;

      switch (eventType) {
        case "INSERT":
          const modifiedExpense = {
            ...expense,
            category: getCategoryNameById(expense.category) ?? "Uncategorized",
          };

          if (!expenses) return setExpenses([modifiedExpense]);
          setExpenses([modifiedExpense, ...expenses]);
          break;
        case "UPDATE":
          if (!expenses) return;
          setExpenses(
            expenses.map((expense) =>
              expense.id === old.id ? modifiedExpense : expense,
            ),
          );
          break;
        case "DELETE":
          if (!expenses) return;
          setExpenses(expenses?.filter((expense) => expense.id !== old.id));
          break;
        default:
          console.log("Unknown event type");
      }
    },
  );

  return {
    subscribeToExpense,
  };
};
