import { z } from "zod";
import type { TFunction } from "i18next";

// export const createAddExpenseSchema = (t: TFunction) =>
//   z.object({
//     name: z
//       .string(t("validation.name_required"))
//       .min(1, t("validation.name_required")),
//     amount: z
//       .string(t("validation.amount_required"))
//       .min(1, t("validation.amount_required"))
//       .refine(
//         (val) => /^\d+(\.\d{1,2})?$/.test(val),
//         t("validation.max_2_decimals"),
//       )
//       .refine((val) => parseFloat(val) > 0, t("validation.must_be_positive"))
//       .transform(Number),
//     category: z
//       .string(t("validation.category_required"))
//       .trim()
//       .min(1, t("validation.category_required"))
//       .transform(Number),
//     is_expense: z.stringbool(),
//     spend_date: z.string(),
//   });

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
