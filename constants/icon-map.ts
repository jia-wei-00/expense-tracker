import {
  Utensils,
  DollarSign,
  Home,
  Car,
  Users,
  Zap,
  HeartPulse,
  TrendingUp,
  Pickaxe,
  Circle,
} from "lucide-react-native";
import type { TCategoryIconMap } from "@/types/constant/icon-map";

export const CATEGORIES = [
  "Food",
  "Others",
  "Salary",
  "Household",
  "Transportation",
  "Living",
  "Entertainment",
  "Healthcare",
  "Investment",
  "Custom",
] as const;

export const CATEGORY_ICON_MAP = {
  Food: Utensils,
  Others: Circle,
  Salary: DollarSign,
  Household: Home,
  Transportation: Car,
  Living: Users,
  Entertainment: Zap,
  Healthcare: HeartPulse,
  Investment: TrendingUp,
  Custom: Pickaxe,
} as const satisfies TCategoryIconMap;
