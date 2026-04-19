import React, { useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Container from "@/components/shared/Container";
import ActionSheet from "@/components/shared/ActionSheet";
import LoanStats from "@/components/loan/LoanStats";
import { useLoanById, useLoanRecords, useDeleteLoanRecord } from "@/hooks/useLoan";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Trash2 } from "lucide-react-native";
import type { TLoanRecord } from "@/types/store/useLoan";

const Separator = () => <Divider className="my-2" />;

const LoanDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  const loanId = Number(id);
  const { t } = useTranslation("loan");
  const { t: tCommon } = useTranslation("common");
  const loan = useLoanById(loanId);
  const { data: records = [] } = useLoanRecords(loanId);
  const { mutateAsync: deleteRecord, isPending: isDeleting } =
    useDeleteLoanRecord();
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const handleConfirmDelete = async () => {
    if (!selectedRecordId) return;
    await deleteRecord({ id: selectedRecordId, loanId });
    setSelectedRecordId(null);
  };

  const renderItem = useCallback(
    ({ item }: { item: TLoanRecord }) => (
      <HStack className="p-2 items-center justify-between">
        <VStack>
          <Text className="font-medium">
            {tCommon("currency.prefix")}
            {parseFloat(item.amount ?? "0").toFixed(2)}
          </Text>
          <Text size="xs" className="text-typography-500">
            {dayjs(item.pay_date).format("YYYY-MM-DD")}
          </Text>
          <Text size="xs" className="text-typography-400">
            {t("created.on", {
              date: dayjs(item.created_at).format("YYYY-MM-DD"),
            })}
          </Text>
        </VStack>
        <Button
          size="sm"
          variant="link"
          action="negative"
          onPress={() => setSelectedRecordId(item.id)}
        >
          <Icon as={Trash2} size="sm" className="text-error-600" />
        </Button>
      </HStack>
    ),
    [tCommon, t],
  );

  const ListHeader = (
    <Box className="mb-4">
      <Heading size="xl" className="mb-2">
        {loan?.name}
      </Heading>
      <LoanStats
        totalAmount={loan?.total_amount ?? 0}
        paidAmount={loan?.paid_amount ?? 0}
        remainingAmount={loan?.remaining_amount ?? 0}
      />
      <Heading size="md" className="mt-4 mb-1">
        {t("payments")}
      </Heading>
    </Box>
  );

  return (
    <>
      <Container>
        <FlashList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <Text className="text-center py-4">{t("no.records")}</Text>
          }
          contentContainerClassName="bg-background-0 p-3 rounded-2xl border border-outline-50"
        />
      </Container>

      <ActionSheet
        title={tCommon("confirm.delete")}
        description={tCommon("delete.confirmation.message", {
          item: t("delete.record"),
        })}
        isOpen={!!selectedRecordId}
        onClose={() => setSelectedRecordId(null)}
        isLoading={isDeleting}
        primaryButtonLabel={tCommon(isDeleting ? "deleting" : "delete")}
        primaryButtonAction={handleConfirmDelete}
        secondaryButtonLabel={tCommon("cancel")}
        secondaryButtonAction={() => setSelectedRecordId(null)}
      />
    </>
  );
};

export default LoanDetail;
