import type { FieldValues, ControllerProps } from "react-hook-form";
import type { ElementType } from "react";
import type { LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { InputField } from "@/components/ui/input";

export interface IControlledInput extends Omit<
  ComponentProps<typeof InputField>,
  "onChangeText"
> {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  helperText?: string;
  isDisabled?: boolean;
  /**
   * icon to be displayed at the end of the input
   */
  suffix?: {
    onPress: () => void;
    icon: LucideIcon;
  };
}
