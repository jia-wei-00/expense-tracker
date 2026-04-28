import React, { useState, useRef, useCallback } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import Container from "@/components/shared/Container";
import { useAgentChat } from "@/hooks/useAgent";
import { TChatMessage } from "@/types/page/agent";
import ChatBubble from "@/components/agent/ChatBubble";
import SuggestionsPanel from "@/components/agent/SuggestionsPanel";
import ChatInput from "@/components/agent/ChatInput";

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList<TChatMessage>,
);

const MessageSeparator = () => <Box className="h-1" />;

export default function AgentScreen() {
  const { t } = useTranslation("agent");
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlashList<TChatMessage>>(null);

  const {
    messages,
    isStreaming,
    isSubmitting,
    sendMessage,
    updateSuggestion,
    removeSuggestion,
    submitSuggestions,
    clearSuggestions,
  } = useAgentChat();

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText("");
    await sendMessage(text);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, isStreaming, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: TChatMessage }) => {
      if (item.suggestions && item.suggestions.length > 0) {
        return (
          <SuggestionsPanel
            suggestions={item.suggestions}
            isSubmitting={isSubmitting}
            onApproveAll={() => submitSuggestions(item.id, item.suggestions!)}
            onClear={() => clearSuggestions(item.id)}
            onUpdate={(index, updated) =>
              updateSuggestion(item.id, index, updated)
            }
            onRemove={(index) => removeSuggestion(item.id, index)}
          />
        );
      }
      return (
        <ChatBubble
          role={item.role}
          content={item.content}
          isLoading={item.isLoading}
        />
      );
    },
    [
      isSubmitting,
      submitSuggestions,
      clearSuggestions,
      updateSuggestion,
      removeSuggestion,
    ],
  );

  const keyExtractor = useCallback((item: TChatMessage) => item.id, []);

  return (
    <Container title={t("title")}>
      {() => (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <Box className="flex-1">
            {messages.length === 0 ? (
              <Box className="flex-1 items-center justify-center">
                <Text className="text-typography-400 text-center text-sm leading-relaxed">
                  {t("empty.state")}
                </Text>
              </Box>
            ) : (
              <AnimatedFlashList
                ref={listRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={MessageSeparator}
                contentContainerStyle={{ paddingBottom: 8 }}
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
              />
            )}
          </Box>

          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            isDisabled={isStreaming}
          />
        </KeyboardAvoidingView>
      )}
    </Container>
  );
}
