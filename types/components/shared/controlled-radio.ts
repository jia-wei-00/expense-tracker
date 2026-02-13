export interface IControlledRadio {
  name: string;
  label?: string;
  variant?: "underlined" | "outline" | "rounded" | undefined;
  placeholder?: string;
  helperText?: string;
  items?: Array<{ label: string; value: string }> | undefined;
  isCalendar?: boolean;
}
