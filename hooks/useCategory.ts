import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";

const fetchCategories = async (userId: string) => {
  const { data, error } = await supabase
    .from("expense_category")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

export const useCategory = () => {
  const userId = useSessionStore.getState().getUserId();

  return useQuery({
    queryKey: [QUERY_KEY.CATEGORIES, userId],
    queryFn: () => fetchCategories(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryNameById = (id: number | null) => {
  const { data: categories } = useCategory();
  if (!id || !categories) return null;
  return categories.find((c) => c.id === id)?.name ?? null;
};

export const useGetCategoryIdByName = (name: string | null | undefined) => {
  const { data: categories } = useCategory();
  if (!name || !categories) return null;
  return categories.find((c) => c.name === name)?.id ?? null;
};
