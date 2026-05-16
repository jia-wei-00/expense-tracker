import React, { useCallback, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { Divider } from "@/components/ui/divider";
import { VStack } from "@/components/ui/vstack";
import TransactionItem from "@/components/shared/TransactionItem";
import Container from "@/components/shared/Container";
import { useTranslation } from "react-i18next";
import { useInfiniteExpenses } from "@/hooks/useExpenses";
import type { IExpense } from "@/types/store/useExpenses";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<IExpense>);

const Separator = () => <Divider className="my-2" />;

const History = () => {
  const { t } = useTranslation("home");
  const {
    data: expensesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteExpenses();

  const expenses = useMemo(
    () => expensesData?.pages.flat() ?? [],
    [expensesData],
  );

  const renderItem = useCallback(
    ({ item }: { item: IExpense }) => <TransactionItem {...item} pressable />,
    [],
  );

  const ListFooter = isFetchingNextPage ? (
    <Text className="text-center py-2">{t("loading")}</Text>
  ) : hasNextPage ? null : (
    <Text className="text-center py-2">{t("list.end")}</Text>
  );

  return (
    <>
      <Container title={t("transaction.history")}>
        {({ scrollHandler }) => (
          <AnimatedFlashList
            data={expenses}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={
              <Text className="px-3">{t("no.expenses")}</Text>
            }
            ListFooterComponent={ListFooter}
            contentContainerClassName="bg-background-0 p-3 rounded-2xl border border-outline-50 gap-2"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onEndReached={fetchNextPage}
            onEndReachedThreshold={0.5}
          />
        )}
      </Container>

      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => router.push("/expense/add")}
      >
        <FabIcon as={Plus} />
      </Fab>
    </>
  );
};

export default History;
