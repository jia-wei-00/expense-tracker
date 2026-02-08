import { z } from "zod";
import { CATEGORIES } from "@/constants/icon-map";
import { type LucideIcon } from "lucide-react-native";

export const categorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof categorySchema>;
export type TCategoryIconMap = Record<Category, LucideIcon>;
