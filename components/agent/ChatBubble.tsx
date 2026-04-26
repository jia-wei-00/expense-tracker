import React from "react";
import { ActivityIndicator } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { IChatBubble } from "@/types/components/agent/chat-bubble";

const ChatBubble = ({ role, content, isLoading }: IChatBubble) => {
  const isUser = role === "user";

  return (
    <Box
      className={`max-w-[80%] rounded-2xl px-4 py-3 mb-2 ${
        isUser
          ? "self-end bg-primary-500 rounded-br-sm"
          : "self-start bg-background-100 rounded-bl-sm"
      }`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text
          className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-typography-900"}`}
        >
          {content}
        </Text>
      )}
    </Box>
  );
};

export default ChatBubble;
