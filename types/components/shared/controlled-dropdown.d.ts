import type { FieldValues, ControllerProps } from "react-hook-form";
import type { ElementType } from "react";
import type { LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { InputField } from "@/components/ui/input";

export interface IControlledDropdown {
  name: string;
  label?: string;
  variant?: "underlined" | "outline" | "rounded" | undefined;
  placeholder?: string;
  helperText?: string;
}
