import React from "react";
import { ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { IChatInput } from "@/types/components/agent/chat-input";
import { ImagePlus, X } from "lucide-react-native";

const ChatInput = ({
  value,
  onChange,
  onSend,
  isDisabled,
  pendingImageUrl,
  isUploading,
  onPickImage,
  onRemoveImage,
}: IChatInput) => {
  const { t } = useTranslation("agent");

  return (
    <VStack className="border-t border-outline-100 pt-2 pb-1">
      {(isUploading || pendingImageUrl) && (
        <Box className="mb-2">
          {isUploading ? (
            <Box className="w-20 h-16 rounded-xl bg-background-200 items-center justify-center">
              <ActivityIndicator size="small" />
            </Box>
          ) : (
            <Box className="w-20">
              <Image
                source={{ uri: pendingImageUrl! }}
                style={{ width: 80, height: 60, borderRadius: 8 }}
                contentFit="cover"
              />
              <Button
                variant="solid"
                size="xs"
                className="absolute -top-2 -right-2 rounded-full w-5 h-5 p-0 bg-background-900 min-w-0"
                onPress={onRemoveImage}
              >
                <ButtonIcon as={X} className="text-white" size="xs" />
              </Button>
            </Box>
          )}
        </Box>
      )}

      <HStack space="sm" className="items-end">
        <Button
          variant="link"
          size="md"
          onPress={onPickImage}
          isDisabled={isDisabled || isUploading}
        >
          <ButtonIcon as={ImagePlus} className="text-typography-500" />
        </Button>
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
          disabled={
            isDisabled || isUploading || (!value.trim() && !pendingImageUrl)
          }
          className="self-end"
        >
          <ButtonText>{t("send")}</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
};

export default ChatInput;
