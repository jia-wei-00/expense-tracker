import React, { useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import Container from "@/components/shared/Container";
import LoanCard from "@/components/loan/LoanCard";
import AddLoanModal from "@/components/loan/AddLoanModal";
import { useLoans } from "@/hooks/useLoan";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import type { ILoan } from "@/types/store/useLoan";
import { Fab, FabIcon } from "@/components/ui/fab";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<ILoan>);

const Separator = () => <Box className="h-2" />;

const Loans = () => {
  const { t } = useTranslation("loan");
  const { data: loans = [] } = useLoans();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const renderItem = useCallback(
    ({ item }: { item: ILoan }) => <LoanCard loan={item} />,
    [],
  );

  return (
    <>
      <Container title={t("loans")}>
        {({ scrollHandler }) => (
          <AnimatedFlashList
            data={loans}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text className="text-center py-6">{t("no.loans")}</Text>
            }
            ItemSeparatorComponent={Separator}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          />
        )}
      </Container>

      <AddLoanModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => setAddModalOpen(true)}
      >
        <FabIcon as={Plus} />
      </Fab>
    </>
  );
};

export default Loans;
