import type { LucideIcon } from "lucide-react-native";

export interface ISettingsLink {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}
