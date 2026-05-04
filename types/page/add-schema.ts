import type { TFunction } from "i18next";
import { z } from "zod";

export const createAddExpenseSchema = (t: TFunction) =>
  z.object({
    name: z.string({ message: t("validation.name_required") }),
    amount: z
      .number({ message: t("validation.amount_required") })
      .min(0.01, { message: t("validation.amount_required") }),
    category: z
      .number({ message: t("validation.category_required") })
      .min(1, { message: t("validation.category_required") }),
    is_expense: z.boolean(),
    spend_date: z.iso.datetime(),
  });

export type TAddExpenseInput = z.input<
  ReturnType<typeof createAddExpenseSchema>
>;
export type TAddExpenseOutput = z.infer<
  ReturnType<typeof createAddExpenseSchema>
>;
