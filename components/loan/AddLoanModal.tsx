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
import { useAddLoan } from "@/hooks/useLoan";
import {
  createAddLoanSchema,
  type TAddLoanInput,
  type TAddLoanOutput,
} from "@/types/page/loan-schema";
import type { IAddLoanModal } from "@/types/components/loan/add-loan-modal";

const AddLoanModal = ({ isOpen, onClose }: IAddLoanModal) => {
  const { t } = useTranslation("loan");
  const { t: tCommon } = useTranslation("common");
  const { mutateAsync: addLoan, isPending } = useAddLoan();

  const methods = useForm<TAddLoanInput, unknown, TAddLoanOutput>({
    resolver: zodResolver(createAddLoanSchema(t)),
  });

  const onSubmit = async (data: TAddLoanOutput) => {
    await addLoan(data);
    methods.reset();
    onClose();
  };

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">{t("add.loan")}</Heading>
          <ModalCloseButton onPress={handleClose}>
            <Icon as={X} size="sm" />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody>
          <FormProvider {...methods}>
            <VStack space="md">
              <ControlledInput
                label={t("loan.name")}
                name="name"
                placeholder={t("loan.name")}
              />
              <ControlledInput
                label={t("total.amount")}
                name="total_amount"
                placeholder="0.00"
                keyboardType="numeric"
                valueType="number"
              />
              <ControlledInput
                label={`${t("interest.rate")} ${t("optional")}`}
                name="interest_rate"
                placeholder="0.00"
                keyboardType="numeric"
                valueType="number"
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
            <ButtonText>{t(isPending ? "adding" : "add.loan")}</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddLoanModal;
