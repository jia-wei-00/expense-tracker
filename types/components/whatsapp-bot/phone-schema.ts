import type { TFunction } from "i18next";
import { z } from "zod";

export const createPhoneSchema = (t: TFunction) =>
  z.object({
    phone_number: z
      .string()
      .regex(/^[1-9]\d{6,14}$/, t("whatsapp.error.format")),
  });

export type TPhoneForm = z.infer<ReturnType<typeof createPhoneSchema>>;
