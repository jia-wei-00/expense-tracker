import type { FieldValues, ControllerProps } from "react-hook-form";

export interface IControlledInput {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "password";
  className?: string;
  helperText?: string;
}
