import type { TFunction } from "i18next";
import { z } from "zod";

export const createRecurringSchema = (t: TFunction) =>
  z.object({
    name: z.string({ message: t("validation.name_required") }),
    amount: z
      .number({ message: t("validation.amount_required") })
      .min(0.01, { message: t("validation.amount_required") }),
    category: z
      .number({ message: t("validation.category_required") })
      .min(1, { message: t("validation.category_required") }),
    is_expense: z.boolean(),
    day_of_month: z
      .number({ message: t("validation.day_required") })
      .min(1, { message: t("validation.day_required") })
      .max(28, { message: t("validation.day_required") }),
  });

export type TRecurringFormInput = z.input<
  ReturnType<typeof createRecurringSchema>
>;
export type TRecurringFormOutput = z.infer<
  ReturnType<typeof createRecurringSchema>
>;
