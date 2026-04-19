import type { Database } from "@/database.types";

export type TLoan = Database["public"]["Tables"]["loan"]["Row"];
export type TLoanRecord = Database["public"]["Tables"]["loan_record"]["Row"];
export type TAddLoan = Pick<
  Database["public"]["Tables"]["loan"]["Insert"],
  "name" | "total_amount" | "interest_rate"
>;
export type TAddLoanRecord = Pick<
  Database["public"]["Tables"]["loan_record"]["Insert"],
  "amount" | "pay_date" | "loan"
>;

export interface ILoan extends TLoan {
  paid_amount: number;
  remaining_amount: number;
}
