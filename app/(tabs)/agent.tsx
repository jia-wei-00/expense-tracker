import ChatBubble from "@/components/agent/ChatBubble";
import ChatInput from "@/components/agent/ChatInput";
import PendingActionPanel from "@/components/agent/PendingActionPanel";
import Container from "@/components/shared/Container";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useChat } from "@/hooks/useAgent";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useCategory } from "@/hooks/useCategory";
import { useErrorToast } from "@/hooks/useErrorToast";
import { TDisplayMessage } from "@/types/hooks/use-agent";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MessageSeparator = () => <Box className="h-1" />;

export default function AgentScreen() {
  const { t } = useTranslation("agent");
  const { bottom } = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const listRef = useRef<FlashListRef<TDisplayMessage>>(null);

  const { data: categories } = useCategory();
  const { showError } = useErrorToast();
  const { pickAndUpload, isUploading } = useImageUpload();

  const {
    messages,
    loading,
    pendingToolCall,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    removeItem,
  } = useChat();

  const displayMessages: TDisplayMessage[] = loading
    ? [...messages, { role: "assistant", content: "", isLoading: true }]
    : messages;

  const handlePickImage = async () => {
    try {
      const url = await pickAndUpload();
      if (url) setPendingImageUrl(url);
    } catch (err: any) {
      showError(err?.message ?? t("error"));
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if ((!text && !pendingImageUrl) || loading) return;
    setInputText("");
    const imageUrl = pendingImageUrl;
    setPendingImageUrl(null);
    await sendMessage(text, imageUrl ?? undefined);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, loading, pendingImageUrl, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: TDisplayMessage }) => (
      <ChatBubble
        role={item.role}
        content={item.content}
        isLoading={item.isLoading}
      />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (_: TDisplayMessage, index: number) => String(index),
    [],
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : bottom}
    >
      <Container title={t("title")}>
        {() => (
          <Box className="flex-1">
            {messages.length > 0 && (
              <Box className="items-end pb-1">
                <Button
                  variant="link"
                  size="sm"
                  onPress={clearMessages}
                  isDisabled={loading}
                >
                  <ButtonText className="text-typography-400">
                    {t("clear")}
                  </ButtonText>
                </Button>
              </Box>
            )}
            {displayMessages.length === 0 ? (
              <Box className="flex-1 items-center justify-center">
                <Text className="text-typography-400 text-center text-sm leading-relaxed">
                  {t("empty.state")}
                </Text>
              </Box>
            ) : (
              <FlashList
                ref={listRef}
                data={displayMessages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={MessageSeparator}
                contentContainerStyle={{ paddingBottom: 8 }}
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
              />
            )}

            {pendingToolCall && (
              <PendingActionPanel
                pendingToolCalls={pendingToolCall}
                categories={categories}
                onConfirm={confirmAction}
                onCancel={cancelAction}
                onRemoveItem={removeItem}
              />
            )}

            <ChatInput
              value={inputText}
              onChange={setInputText}
              onSend={handleSend}
              isDisabled={loading}
              pendingImageUrl={pendingImageUrl}
              isUploading={isUploading}
              onPickImage={handlePickImage}
              onRemoveImage={() => setPendingImageUrl(null)}
            />
          </Box>
        )}
      </Container>
    </KeyboardAvoidingView>
  );
}
