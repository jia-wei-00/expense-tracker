import React from "react";
import type { IExpense } from "@/types/store/useExpenses";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";
import { CATEGORY_ICON_MAP } from "@/constants/icon-map";
import { Icon } from "@/components/ui/icon";
import { safeParseAny } from "@/utils/zod-utils";
import { categorySchema } from "@/types/constant/icon-map";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import dayjs from "dayjs";
import { router } from "expo-router";

const TransactionItem = ({
  id,
  category,
  name,
  spend_date,
  is_expense,
  amount,
}: IExpense) => {
  const safeCategory = safeParseAny(categorySchema, category, "Others");
  const IconComponent = CATEGORY_ICON_MAP[safeCategory];

  const date = dayjs(spend_date).format("dddd • YYYY-MM-DD");

  const handlePress = () => {
    router.push({
      pathname: "/expense-details/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <HStack className="p-2 items-center" space="lg">
        <Box className="rounded-full p-3 bg-background-100">
          <Icon as={IconComponent} />
        </Box>
        <VStack className="flex-1">
          <Text>{name}</Text>
          <Text size="xs">{date}</Text>
        </VStack>
        <HStack space="xs">
          {!is_expense && <Text className="text-success-600">+</Text>}
          <Text
            className={is_expense ? "text-typography-600" : "text-success-600"}
          >
            RM{amount}
          </Text>
        </HStack>
      </HStack>
    </Pressable>
  );
};

export default TransactionItem;
