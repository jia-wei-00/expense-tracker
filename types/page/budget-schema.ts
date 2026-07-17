import type { TFunction } from "i18next";
import { z } from "zod";

// category 0 = overall budget (stored as null)
export const createBudgetSchema = (t: TFunction) =>
  z.object({
    category: z.number({ message: t("validation.category_required") }),
    amount: z
      .number({ message: t("validation.amount_required") })
      .min(0.01, { message: t("validation.amount_required") }),
  });

export type TBudgetFormInput = z.input<ReturnType<typeof createBudgetSchema>>;
export type TBudgetFormOutput = z.infer<ReturnType<typeof createBudgetSchema>>;
