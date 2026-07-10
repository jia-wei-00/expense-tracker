import React from "react";
import { Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import Badge from "@/components/shared/Badge";
import { HStack } from "@/components/ui/hstack";
import { ICategoryFilter } from "@/types/components/home/category-filter";
import { cn } from "@/lib/utils";

const CategoryFilter = ({ categories, excluded, onToggle }: ICategoryFilter) => {
  return (
    <HStack space="sm" className="flex-wrap">
      {categories.map((item) => {
        const isActive = !excluded.includes(item.label);
        return (
          <Pressable key={item.label} onPress={() => onToggle(item.label)}>
            <HStack
              space="sm"
              className={cn(
                "items-center rounded-full border border-outline-100 px-3 py-1.5",
                !isActive && "opacity-40",
              )}
            >
              <Badge className={item.colorClass} />
              <Text size="sm" numberOfLines={1}>
                {item.label}
              </Text>
            </HStack>
          </Pressable>
        );
      })}
    </HStack>
  );
};

export default CategoryFilter;
