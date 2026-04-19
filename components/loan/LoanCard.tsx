import React, { useState } from "react";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import dayjs from "dayjs";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Trash2, Plus } from "lucide-react-native";
import ActionSheet from "@/components/shared/ActionSheet";
import AddLoanRecordModal from "@/components/loan/AddLoanRecordModal";
import { useDeleteLoan } from "@/hooks/useLoan";
import LoanStats from "@/components/loan/LoanStats";
import type { ILoanCard } from "@/types/components/loan/loan-card";

const LoanCard = ({ loan }: ILoanCard) => {
  const { t } = useTranslation("loan");
  const { t: tCommon } = useTranslation("common");
  const { mutateAsync: deleteLoan, isPending: isDeleting } = useDeleteLoan();
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  const handlePress = () => {
    router.push({
      pathname: "/loan/[id]",
      params: { id: String(loan.id) },
    });
  };

  const handleConfirmDelete = async () => {
    await deleteLoan(loan.id);
    setDeleteSheetOpen(false);
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <Box className="bg-background-0 rounded-2xl p-4 ">
          <HStack className="items-start justify-between mb-3">
            <VStack>
              <Heading size="sm">{loan.name}</Heading>
              <Text size="xs" className="text-typography-500">
                {t("created.on", {
                  date: dayjs(loan.created_at).format("YYYY-MM-DD"),
                })}
              </Text>
              {!!loan.interest_rate && (
                <Text size="xs" className="text-typography-500">
                  {t("interest.rate")}: {loan.interest_rate}%
                </Text>
              )}
            </VStack>
            <Button
              size="sm"
              variant="link"
              action="negative"
              onPress={(e) => {
                e.stopPropagation?.();
                setDeleteSheetOpen(true);
              }}
            >
              <Icon as={Trash2} size="sm" className="text-error-600" />
            </Button>
          </HStack>

          <Box className="mb-3">
            <LoanStats
              totalAmount={loan.total_amount ?? 0}
              paidAmount={loan.paid_amount}
              remainingAmount={loan.remaining_amount}
            />
          </Box>

          <Button
            size="sm"
            variant="outline"
            onPress={(e) => {
              e.stopPropagation?.();
              setRecordModalOpen(true);
            }}
          >
            <Icon as={Plus} size="xs" />
            <ButtonText>{t("add.record")}</ButtonText>
          </Button>
        </Box>
      </Pressable>

      <ActionSheet
        title={tCommon("confirm.delete")}
        description={tCommon("delete.confirmation.message", {
          item: loan.name,
        })}
        isOpen={deleteSheetOpen}
        onClose={() => setDeleteSheetOpen(false)}
        isLoading={isDeleting}
        primaryButtonLabel={tCommon(isDeleting ? "deleting" : "delete")}
        primaryButtonAction={handleConfirmDelete}
        secondaryButtonLabel={tCommon("cancel")}
        secondaryButtonAction={() => setDeleteSheetOpen(false)}
      />

      <AddLoanRecordModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        loanId={loan.id}
      />
    </>
  );
};

export default React.memo(LoanCard);
