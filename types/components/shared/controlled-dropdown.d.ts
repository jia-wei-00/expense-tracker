import { TValueType } from "@/types/components/shared/controlled-radio";

export interface IControlledDropdown {
  name: string;
  label?: string;
  variant?: "underlined" | "outline" | "rounded" | undefined;
  placeholder?: string;
  helperText?: string;
  items?: Array<{ label: string; value: string }> | undefined;
  isCalendar?: boolean;
  valueType?: TValueType;
  displayValue?: string;
}
