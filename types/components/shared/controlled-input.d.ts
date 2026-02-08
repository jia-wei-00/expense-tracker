import type { FieldValues, ControllerProps } from "react-hook-form";
import type { ElementType } from "react";
import type { LucideIcon } from "lucide-react-native";

export interface IControlledInput {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "password";
  className?: string;
  helperText?: string;
  /**
   * icon to be displayed at the end of the input
   */
  suffix?: {
    onPress: () => void;
    icon: LucideIcon;
  };
}
