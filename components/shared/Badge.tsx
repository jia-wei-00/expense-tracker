import { IBadge } from "@/types/components/shared/badge";
import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

const Badge = ({ className }: IBadge) => {
  return <View className={twMerge("h-3 w-3 rounded-full", className)} />;
};

export default Badge;
