import React, { useCallback, useMemo, useState } from "react";
import { Text } from "@/components/ui/text";
import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { Divider } from "@/components/ui/divider";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import HistoryItem from "@/components/history/HistoryItem";
import Container from "@/components/shared/Container";
import ActionSheet from "@/components/shared/ActionSheet";
import { useTranslation } from "react-i18next";
import { useInfiniteExpenses, useBulkDeleteExpenses } from "@/hooks/useExpenses";
import type { IExpense } from "@/types/store/useExpenses";
import { Fab, FabIcon } from "@/components/ui/fab";
import { Plus } from "lucide-react-native";
import { router } from "expo-router";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<IExpense>);

const Separator = () => <Divider className="my-2" />;

const History = () => {
  const { t } = useTranslation("home");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    data: expensesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteExpenses();

  const { mutate: bulkDelete, isPending: isDeleting } = useBulkDeleteExpenses();

  const expenses = useMemo(
    () => expensesData?.pages.flat() ?? [],
    [expensesData],
  );

  const allSelected =
    expenses.length > 0 && selectedIds.size === expenses.length;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(
      allSelected ? new Set() : new Set(expenses.map((e) => e.id)),
    );
  }, [allSelected, expenses]);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    bulkDelete(Array.from(selectedIds), {
      onSuccess: () => {
        setIsConfirmOpen(false);
        exitSelectMode();
      },
    });
  }, [bulkDelete, selectedIds, exitSelectMode]);

  const renderItem = useCallback(
    ({ item }: { item: IExpense }) => (
      <HistoryItem
        item={item}
        isSelectMode={isSelectMode}
        isSelected={selectedIds.has(item.id)}
        onToggle={() => toggleSelect(item.id)}
      />
    ),
    [isSelectMode, selectedIds, toggleSelect],
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
          <VStack className="flex-1">
            <HStack className="justify-end pb-1">
              {isSelectMode ? (
                <Button variant="link" size="sm" onPress={exitSelectMode}>
                  <ButtonText>{t("select.cancel")}</ButtonText>
                </Button>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  onPress={() => setIsSelectMode(true)}
                >
                  <ButtonText>{t("select")}</ButtonText>
                </Button>
              )}
            </HStack>
            <AnimatedFlashList
              style={{ flex: 1 }}
              data={expenses}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={Separator}
              estimatedItemSize={70}
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
          </VStack>
        )}
      </Container>

      {isSelectMode && (
        <Box className="bg-background-0 border-t border-outline-100 px-4 py-3">
          <HStack className="items-center justify-between">
            <Button variant="link" size="sm" onPress={toggleSelectAll}>
              <ButtonText>
                {allSelected ? t("select.deselect.all") : t("select.all")}
              </ButtonText>
            </Button>
            <Text className="text-sm text-typography-500">
              {t("select.count", { count: selectedIds.size })}
            </Text>
            <Button
              size="sm"
              action="negative"
              isDisabled={selectedIds.size === 0}
              onPress={() => setIsConfirmOpen(true)}
            >
              <ButtonText>
                {t("select.delete", { count: selectedIds.size })}
              </ButtonText>
            </Button>
          </HStack>
        </Box>
      )}

      {!isSelectMode && (
        <Fab
          size="lg"
          placement="bottom right"
          onPress={() => router.push("/expense/add")}
        >
          <FabIcon as={Plus} />
        </Fab>
      )}

      <ActionSheet
        title={t("select.confirm.title")}
        description={t("select.confirm.description", {
          count: selectedIds.size,
        })}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
        primaryButtonLabel={t("select.delete", { count: selectedIds.size })}
        primaryButtonAction={handleDeleteConfirm}
        secondaryButtonLabel={t("select.cancel")}
        secondaryButtonAction={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default History;
