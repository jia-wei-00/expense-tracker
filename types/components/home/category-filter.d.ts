import { TLegend } from "./legend";

export interface ICategoryFilter {
  categories: TLegend[];
  excluded: string[];
  onToggle: (label: string) => void;
}
