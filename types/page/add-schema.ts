import { z } from "zod";

export const addExpenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .string()
    .min(1, "Amount required")
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), "Max 2 decimals")
    .refine((val) => parseFloat(val) > 0, "Must be positive"),
  category: z.number().int().positive("Category is required"),
  is_expense: z.boolean(),
  spend_date: z.date(),
});

export type TAddExpense = z.infer<typeof addExpenseSchema>;
