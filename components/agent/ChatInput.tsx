import React from "react";
import { ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { IChatInput } from "@/types/components/agent/chat-input";
import { ImagePlus, ScanLine, X, ArrowUp } from "lucide-react-native";
import { cn } from "@/lib/utils";

const ChatInput = ({
  value,
  onChange,
  onSend,
  isDisabled,
  pendingImageUrl,
  isUploading,
  onPickImage,
  onRemoveImage,
  onScanReceipt,
}: IChatInput) => {
  const { t } = useTranslation("agent");
  const canSend = !isDisabled && !isUploading && !!(value.trim() || pendingImageUrl);

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

        <Button
          variant="link"
          size="md"
          onPress={onScanReceipt}
          isDisabled={isDisabled || isUploading}
        >
          <ButtonIcon as={ScanLine} className="text-typography-500" />
        </Button>

        <Input variant="outline" size="md" className="flex-1 rounded-2xl">
          <InputField
            placeholder={t("placeholder")}
            value={value}
            onChangeText={onChange}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={onSend}
          />
        </Input>

        <Box
          className={cn(
            "w-10 h-10 rounded-full items-center justify-center",
            canSend
              ? "bg-[rgb(40,40,40)] dark:bg-[rgb(230,230,230)]"
              : "bg-[rgb(220,219,219)] dark:bg-[rgb(55,54,54)]"
          )}
        >
          <Button
            variant="link"
            size="md"
            onPress={onSend}
            isDisabled={!canSend}
            className="w-10 h-10 rounded-full p-0"
          >
            <ButtonIcon
              as={ArrowUp}
              className={cn(
                canSend
                  ? "text-[rgb(240,240,240)] dark:text-[rgb(20,20,20)]"
                  : "text-[rgb(150,150,150)] dark:text-[rgb(100,100,100)]"
              )}
            />
          </Button>
        </Box>
      </HStack>
    </VStack>
  );
};

export default ChatInput;
