import type { FieldValues, ControllerProps } from "react-hook-form";
import type { ElementType } from "react";
import type { LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { InputField } from "@/components/ui/input";
import type { ReactNode } from "react";

export interface IControlledDropdown {
  name: string;
  label?: string;
  variant?: "underlined" | "outline" | "rounded" | undefined;
  placeholder?: string;
  helperText?: string;
  items?: Array<{ label: string; value: string }> | undefined;
  isCalendar?: boolean;
}
