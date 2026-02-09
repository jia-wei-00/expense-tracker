import React from "react";
import dayjs from "dayjs";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import Container from "@/components/shared/Container";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useExpensesStore } from "@/store/useExpenses";
import { useSessionStore } from "@/store/useSession";
import { View } from "react-native";
import { Box } from "@/components/ui/box";
import TransactionItem from "@/components/shared/TransactionItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Plus } from "lucide-react-native";
import { VStack } from "@/components/ui/vstack";

const Home = () => {
  const currentMonth = dayjs().format("MMMM YYYY");
  const { t } = useTranslation("home");
  const expenses = useExpensesStore((state) => state.expenses);
  const getExpenses = useExpensesStore((state) => state.getExpenses);
  const session = useSessionStore((state) => state.session);

  React.useEffect(() => {
    getExpenses();
  }, [session]);

  const handleViewAll = () => {
    router.push("/(tabs)/explore");
  };

  return (
    <>
      <Container title={t("insights")}>
        <View className="gap-2">
          <Text bold size="lg">
            {currentMonth}
          </Text>
          <VStack space="sm">
            <Text size="lg" bold>
              {t("recent.transaction")}
            </Text>
            <Box className="bg-background-0 p-3 rounded-2xl border border-outline-50 gap-2">
              <FlashList
                data={expenses?.slice(0, 10)}
                ItemSeparatorComponent={() => <Divider className="my-2" />}
                ListEmptyComponent={<Text>{t("no.expenses")}</Text>}
                renderItem={({ item }) => <TransactionItem {...item} />}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button
                variant="link"
                className="rounded-full my-1"
                onPress={handleViewAll}
                size="sm"
              >
                <ButtonText>{t("view.all")}</ButtonText>
              </Button>
            </Box>
          </VStack>
        </View>
      </Container>
      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => router.push("/(tabs)/add")}
      >
        <FabIcon as={Plus} />
      </Fab>
    </>
  );
};

export default Home;
