import React from "react";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { ILegend } from "@/types/components/home/legend";
import { HStack } from "../ui/hstack";
import { twMerge } from "tailwind-merge";

const Legend = ({ data }: ILegend) => {
  return (
    <View>
      <HStack>
        {data.map((item, index) => {
          return (
            <HStack className="items-center mr-4" space="sm" key={index}>
              <View
                className={twMerge(
                  "w-3 h-[2px] rounded-sm",
                  `bg-${item.color}-500`,
                )}
              />
              <Text>{item.label}</Text>
            </HStack>
          );
        })}
      </HStack>
    </View>
  );
};

export default Legend;
