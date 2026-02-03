import React from "react";
import dayjs from "dayjs";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import Container from "@/components/shared/Container";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import { useExpensesStore } from "@/store/useExpenses";
import { useSessionStore } from "@/store/useSession";
import { ScrollView } from "react-native";

const Home = () => {
  const currentMonth = dayjs().format("MMMM YYYY");
  const { t } = useTranslation("home");
  const expenses = useExpensesStore((state) => state.expenses);
  const getExpenses = useExpensesStore((state) => state.getExpenses);
  const session = useSessionStore((state) => state.session);

  React.useEffect(() => {
    getExpenses();
  }, [session]);

  return (
    <Container title="Insights" className="gap-2">
      <Heading size="2xl" className="mb-2">
        {t("insights")}
      </Heading>
      <Text className="bg-background-pure" size="lg">
        {currentMonth}
      </Text>
      <Text bold>{t("recent.transaction")}</Text>
      <FlashList
        data={expenses}
        ListEmptyComponent={<Text>{t("no.expenses")}</Text>}
        renderItem={({ item }) => <Text>{item.id}</Text>}
        keyExtractor={(item) => item.id.toString()}
      />
    </Container>
  );
};

export default Home;
