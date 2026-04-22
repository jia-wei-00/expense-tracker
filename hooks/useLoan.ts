import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import type { ILoan, TAddLoan, TAddLoanRecord, TUpdateLoan } from "@/types/store/useLoan";
import { QUERY_KEY } from "@/constants/query-key";

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
  const { data: loans } = useLoans();
  return loans?.find((loan) => loan.id === id);
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
      const { data, error } = await supabase
        .from("loan_record")
        .insert({ ...record, user_id: userId! })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.LOAN_RECORDS, record.loan],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LOANS, userId] });
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
