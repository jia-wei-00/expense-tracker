import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui/modal";
import ControlledInput from "@/components/shared/ControlledInput";
import ControlledDropdown from "@/components/shared/ControlledDropdown";
import { useAddLoanRecord } from "@/hooks/useLoan";
import {
  createAddRecordSchema,
  type TAddRecordInput,
  type TAddRecordOutput,
} from "@/types/page/loan-schema";
import type { IAddLoanRecordModal } from "@/types/components/loan/add-loan-record-modal";
import dayjs from "dayjs";

const AddLoanRecordModal = ({ isOpen, onClose, loanId }: IAddLoanRecordModal) => {
  const { t } = useTranslation("loan");
  const { t: tCommon } = useTranslation("common");
  const { mutateAsync: addRecord, isPending } = useAddLoanRecord();

  const methods = useForm<TAddRecordInput, unknown, TAddRecordOutput>({
    resolver: zodResolver(createAddRecordSchema(t)),
    defaultValues: {
      pay_date: dayjs().toISOString(),
    },
  });

  const onSubmit = async (data: TAddRecordOutput) => {
    await addRecord({
      amount: String(data.amount),
      pay_date: data.pay_date,
      loan: loanId,
    });
    methods.reset({ pay_date: dayjs().toISOString() });
    onClose();
  };

  const handleClose = () => {
    methods.reset({ pay_date: dayjs().toISOString() });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">{t("add.record")}</Heading>
          <ModalCloseButton onPress={handleClose}>
            <Icon as={X} size="sm" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <VStack space="md">
              <ControlledInput
                label={t("payment.amount")}
                name="amount"
                placeholder="0.00"
                keyboardType="numeric"
                valueType="number"
              />
              <ControlledDropdown
                label={t("payment.date")}
                name="pay_date"
                placeholder={t("payment.date")}
                isCalendar
              />
            </VStack>
          </FormProvider>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onPress={handleClose}>
            <ButtonText>{tCommon("cancel")}</ButtonText>
          </Button>
          <Button
            variant="solid"
            onPress={methods.handleSubmit(onSubmit)}
            isDisabled={isPending}
          >
            {isPending && <ButtonSpinner color="gray" />}
            <ButtonText>{t(isPending ? "adding" : "add.record")}</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddLoanRecordModal;
