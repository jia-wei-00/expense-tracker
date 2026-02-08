import type { Database } from "@/database.types";

type TCategory = Database["public"]["Tables"]["expense_category"]["Row"];

export interface ICategoryStore {
  category: TCategory[] | null;
  isFetching: boolean;
  setCategory: (category: TCategory[]) => void;
  getCategory: () => Promise<void>;
  getCategoryNameById: (id: number | null) => string | null | undefined;
}
