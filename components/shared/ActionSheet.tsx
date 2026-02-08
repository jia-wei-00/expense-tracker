import React from "react";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { IActionsheetProps } from "@/types/components/shared/actionsheet";

const ActionSheet = ({
  isOpen,
  title,
  description,
  onClose,
  isLoading,
  primaryButtonLabel,
  secondaryButtonLabel,
  primaryButtonAction,
  secondaryButtonAction,
}: IActionsheetProps) => {
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading size="lg" className="my-3">
          {title}
        </Heading>
        <Text className="my-2">{description}</Text>
        <Button
          variant="solid"
          size="md"
          className="mt-5 rounded-full w-full"
          onPress={primaryButtonAction}
        >
          {isLoading && <ButtonSpinner color="gray" />}
          <ButtonText>{primaryButtonLabel}</ButtonText>
        </Button>
        {secondaryButtonLabel && (
          <Button
            variant="outline"
            size="md"
            className="mt-5 rounded-full w-full border-outline-0"
            onPress={secondaryButtonAction}
          >
            <ButtonText>{secondaryButtonLabel}</ButtonText>
          </Button>
        )}
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ActionSheet;
