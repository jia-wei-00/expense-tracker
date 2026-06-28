import { TExpensePushPayload, TPushExpenseItem } from "@/types/notification";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isExpenseItem = (value: unknown): value is TPushExpenseItem =>
  isRecord(value) &&
  typeof value.name === "string" &&
  typeof value.amount === "number";

/** Type guard for the expense push payload (validates type + expenses shape). */
export const isExpensePushPayload = (
  value: unknown,
): value is TExpensePushPayload => {
  if (!isRecord(value)) return false;
  if (value.type !== "EXPENSE_ADDED" && value.type !== "EXPENSE_UPDATED") {
    return false;
  }
  return Array.isArray(value.expenses) && value.expenses.every(isExpenseItem);
};

/** Parse a serialized payload (from route params) into a typed payload. */
export const parseExpensePush = (
  raw: string | undefined,
): TExpensePushPayload | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isExpensePushPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
