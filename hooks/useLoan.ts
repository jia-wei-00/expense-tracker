import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import type { ILoan, TAddLoan, TAddLoanRecord, TUpdateLoan } from "@/types/store/useLoan";
import { QUERY_KEY } from "@/constants/query-key";

const LOAN_CATEGORY_NAME = "Loan";

const findOrCreateLoanCategory = async (userId: string): Promise<number> => {
  const existing = await supabase
    .from("expense_category")
    .select("id")
    .eq("name", LOAN_CATEGORY_NAME)
    .eq("is_expense", true)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data?.id) return existing.data.id;

  const created = await supabase
    .from("expense_category")
    .insert({
      user_id: userId,
      name: LOAN_CATEGORY_NAME,
      is_expense: true,
    })
    .select("id")
    .single();

  if (created.error) throw created.error;
  return created.data.id;
};

export const useLoans = () => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.LOANS, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan")
        .select("*, loan_record(amount)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((loan) => {
        const paid_amount = (loan.loan_record ?? []).reduce(
          (sum, r) => sum + parseFloat(r.amount ?? "0"),
          0,
        );
        const remaining_amount = (loan.total_amount ?? 0) - paid_amount;
        const { loan_record: _records, ...rest } = loan;
        return { ...rest, paid_amount, remaining_amount } satisfies ILoan;
      });
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLoanById = (id: number) => {
  const userId = useSessionStore((state) => state.getUserId());
  const { data: loans } = useLoans();
  const cached = loans?.find((loan) => loan.id === id);

  // Fallback: when the loan isn't in the list cache (e.g. the details page was
  // opened directly / cold-started), fetch it straight from Supabase by id.
  const { data: fetched } = useQuery({
    queryKey: [QUERY_KEY.LOANS, userId, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan")
        .select("*, loan_record(amount)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const paid_amount = (data.loan_record ?? []).reduce(
        (sum, r) => sum + parseFloat(r.amount ?? "0"),
        0,
      );
      const remaining_amount = (data.total_amount ?? 0) - paid_amount;
      const { loan_record: _records, ...rest } = data;
      return { ...rest, paid_amount, remaining_amount } satisfies ILoan;
    },
    enabled: !!userId && !!id && !cached,
    staleTime: 1000 * 60 * 5,
  });

  return cached ?? fetched ?? undefined;
};

export const useAddLoan = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());

  return useMutation({
    mutationFn: async (loan: TAddLoan) => {
      const { data, error } = await supabase
        .from("loan")
        .insert({ ...loan, user_id: userId! })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());

  return useMutation({
    mutationFn: async ({ id, ...updates }: TUpdateLoan) => {
      const { error } = await supabase
        .from("loan")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("loan").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
    },
  });
};

export const useLoanRecords = (loanId: number) => {
  const userId = useSessionStore((state) => state.getUserId());

  return useQuery({
    queryKey: [QUERY_KEY.LOAN_RECORDS, loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_record")
        .select("*")
        .eq("loan", loanId)
        .order("pay_date", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId && !!loanId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddLoanRecord = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());

  return useMutation({
    mutationFn: async (record: TAddLoanRecord) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("loan_record")
        .insert({ ...record, user_id: userId })
        .select();
      if (error) throw error;

      const loans = queryClient.getQueryData<ILoan[]>([
        QUERY_KEY.LOANS,
        userId,
      ]);
      const loanName =
        loans?.find((l) => l.id === record.loan)?.name ?? LOAN_CATEGORY_NAME;

      const categoryId = await findOrCreateLoanCategory(userId);

      const { error: expenseError } = await supabase.from("expense").insert({
        user_id: userId,
        amount: Number(record.amount ?? 0),
        spend_date: record.pay_date,
        is_expense: true,
        name: loanName,
        category: categoryId,
      });
      if (expenseError) throw expenseError;

      return data;
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.LOAN_RECORDS, record.loan],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORIES] });
      if (record.pay_date) {
        queryClient.invalidateQueries({
          queryKey: [dayjs(record.pay_date).format("YYYY-MM")],
        });
      }
    },
  });
};

export const useDeleteLoanRecord = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());

  return useMutation({
    mutationFn: async ({ id, loanId }: { id: number; loanId: number }) => {
      const { error } = await supabase
        .from("loan_record")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return loanId;
    },
    onSuccess: (loanId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.LOAN_RECORDS, loanId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
    },
  });
};
