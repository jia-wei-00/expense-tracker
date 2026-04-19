import { z } from "zod";
import type { TFunction } from "i18next";

export const createAddLoanSchema = (t: TFunction) =>
  z.object({
    name: z
      .string({ message: t("validation.name_required") })
      .min(1, { message: t("validation.name_required") }),
    total_amount: z
      .number({ message: t("validation.amount_required") })
      .min(0.01, { message: t("validation.amount_required") }),
    interest_rate: z.number().min(0).optional(),
  });

export type TAddLoanInput = z.input<ReturnType<typeof createAddLoanSchema>>;
export type TAddLoanOutput = z.infer<ReturnType<typeof createAddLoanSchema>>;

export const createAddRecordSchema = (t: TFunction) =>
  z.object({
    amount: z
      .number({ message: t("validation.amount_required") })
      .min(0.01, { message: t("validation.amount_required") }),
    pay_date: z.iso.datetime(),
  });

export type TAddRecordInput = z.input<ReturnType<typeof createAddRecordSchema>>;
export type TAddRecordOutput = z.infer<
  ReturnType<typeof createAddRecordSchema>
>;
