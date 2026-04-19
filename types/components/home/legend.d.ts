export type TLegend = {
  value: number;
  label: string;
  color: string;
  gradientCenterColor: string;
  colorClass: string;
  focused?: boolean;
};

export interface ILegend {
  pieData: TLegend[];
  totalExpense: number;
}
