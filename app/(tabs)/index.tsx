import React, { useCallback, useState } from "react";
import dayjs from "dayjs";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import Container from "@/components/shared/Container";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteExpenses } from "@/hooks/useExpenses";
import { RefreshControl, View } from "react-native";
import { Box } from "@/components/ui/box";
import TransactionItem from "@/components/shared/TransactionItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Plus } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";
import Chart from "@/components/home/chart";
import MonthYearPicker from "@/components/home/MonthYearPicker";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/useSession";
import { QUERY_KEY } from "@/constants/query-key";

const Separator = () => <Divider className="my-2" />;

const Home = () => {
  const { t } = useTranslation("home");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().toDate());
  const { data: expensesData } = useInfiniteExpenses();
  const expenses = expensesData?.pages.flat() ?? [];
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.getUserId());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const monthKey = dayjs(selectedMonth).format("YYYY-MM");
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: [monthKey] }),
        queryClient.refetchQueries({ queryKey: [QUERY_KEY.EXPENSES, userId] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, selectedMonth, userId]);

  const handleViewAll = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <>
      <Container
        title={t("insights")}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="gap-2">
          <MonthYearPicker value={selectedMonth} onChange={setSelectedMonth} />
          <Chart type="expense" month={selectedMonth} />
          <Chart type="income" month={selectedMonth} />
          <VStack space="sm">
            <Text size="lg" bold>
              {t("recent.transaction")}
            </Text>
            <Box className="bg-background-0 p-3 rounded-2xl border border-outline-50">
              <FlashList
                data={expenses.slice(0, 5)}
                ItemSeparatorComponent={Separator}
                ListEmptyComponent={<Text>{t("no.expenses")}</Text>}
                renderItem={({ item }) => (
                  <TransactionItem {...item} pressable />
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              {expenses.length > 0 && (
                <Button
                  variant="link"
                  className="rounded-full my-1"
                  onPress={handleViewAll}
                  size="sm"
                >
                  <ButtonText>{t("view.all")}</ButtonText>
                </Button>
              )}
            </Box>
          </VStack>
        </View>
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

export default Home;
