export type TValueType = "string" | "number" | "boolean";

export interface IControlledRadio {
  name: string;
  label?: string;
  variant?: "underlined" | "outline" | "rounded" | undefined;
  placeholder?: string;
  helperText?: string;
  items?:
    | Array<{ label: string; value: string | number | boolean }>
    | undefined;
  isCalendar?: boolean;
  valueType?: TValueType;
}
