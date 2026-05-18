export function normalizeAddExpenseArgs(raw: Record<string, unknown>) {
  return {
    name: String(raw.name ?? raw.description ?? raw.title ?? ""),
    amount: Number(raw.amount ?? 0),
    category: Number(raw.category ?? raw.category_id ?? 0),
    is_expense: raw.is_expense !== undefined ? Boolean(raw.is_expense) : true,
    spend_date: String(raw.spend_date ?? raw.date ?? new Date().toISOString()),
  };
}
