import React from "react";
import { Pressable, View } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Icon, CheckIcon } from "@/components/ui/icon";
import TransactionItem from "@/components/shared/TransactionItem";
import type { IHistoryItem } from "@/types/components/history/history-item";

const HistoryItem = ({
  item,
  isSelectMode,
  isSelected,
  onToggle,
}: IHistoryItem) => {
  if (isSelectMode) {
    return (
      <Pressable onPress={onToggle}>
        <HStack className="items-center">
          <Box
            className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 ${
              isSelected
                ? "bg-primary-500 border-primary-500"
                : "border-outline-400"
            }`}
          >
            {isSelected && (
              <Icon as={CheckIcon} size="xs" className="text-white" />
            )}
          </Box>
          <View style={{ flex: 1 }} pointerEvents="none">
            <TransactionItem {...item} />
          </View>
        </HStack>
      </Pressable>
    );
  }

  return <TransactionItem {...item} pressable />;
};

export default React.memo(HistoryItem);
