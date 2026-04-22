import type { IAddLoanModal } from "@/types/components/loan/add-loan-modal";
import type { ILoan } from "@/types/store/useLoan";

export interface IEditLoanModal extends IAddLoanModal {
  loan: ILoan;
}
