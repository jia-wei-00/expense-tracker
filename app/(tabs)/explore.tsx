import React from "react";
import { Text } from "@/components/ui/text";
import Container from "@/components/shared/Container";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { Box } from "@/components/ui/box";
import TransactionItem from "@/components/shared/TransactionItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { VStack } from "@/components/ui/vstack";
import { useTranslation } from "react-i18next";
import { useInfiniteExpenses } from "@/hooks/useExpenses";

const History = () => {
  const { t } = useTranslation("home");
  const {
    data: expensesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteExpenses();
  const expenses = expensesData?.pages.flat() || [];

  return (
    <Container title={t("history")}>
      <View className="gap-2">
        <VStack space="sm">
          <Text size="lg" bold>
            {t("transaction history")}
          </Text>
          <Box className="bg-background-0 p-3 rounded-2xl border border-outline-50 gap-2">
            <FlashList
              data={expenses}
              ItemSeparatorComponent={() => <Divider className="my-2" />}
              ListEmptyComponent={<Text>{t("no.expenses")}</Text>}
              renderItem={({ item }) => <TransactionItem {...item} />}
              keyExtractor={(item) => item.id.toString()}
              onEndReached={fetchNextPage}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Text>Loading...</Text>
                ) : hasNextPage ? null : (
                  <Text>End</Text>
                )
              }
            />
          </Box>
        </VStack>
      </View>
    </Container>
  );
};

export default History;
