import React from "react";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { IChatInput } from "@/types/components/agent/chat-input";

const ChatInput = ({ value, onChange, onSend, isDisabled }: IChatInput) => {
  const { t } = useTranslation("agent");

  return (
    <HStack
      space="sm"
      className="pt-3 pb-1 border-t border-outline-100 items-end"
    >
      <Input variant="outline" size="md" className="flex-1">
        <InputField
          placeholder={t("placeholder")}
          value={value}
          onChangeText={onChange}
          multiline
          maxLength={500}
          returnKeyType="send"
        />
      </Input>
      <Button
        size="md"
        onPress={onSend}
        disabled={isDisabled || !value.trim()}
        className="self-end"
      >
        <ButtonText>{t("send")}</ButtonText>
      </Button>
    </HStack>
  );
};

export default ChatInput;
