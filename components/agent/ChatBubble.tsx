import React from "react";
import { useColorScheme } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { IChatBubble } from "@/types/components/agent/chat-bubble";
import { cn } from "@/lib/utils";
import BotAvatar from "@/components/agent/BotAvatar";
import TypingDots from "@/components/agent/TypingDots";

const ChatBubble = ({ role, content, isLoading }: IChatBubble) => {
  const isUser = role === "user";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Kept for react-native-markdown-display which requires a plain style object
  const textColor = isUser
    ? isDark ? "rgb(23,23,23)" : "rgb(254,254,255)"
    : isDark ? "rgb(254,254,255)" : "rgb(38,38,39)";
  const codeBlockBg = isDark ? "rgb(39,38,37)" : "rgb(220,219,219)";

  const bubbleClassName = cn(
    "rounded-[18px] px-3.5 py-2.5 max-w-[75%]",
    isUser
      ? "rounded-br-[4px] bg-[rgb(51,51,51)] dark:bg-[rgb(230,230,230)]"
      : "rounded-bl-[4px] bg-[rgb(242,241,241)] dark:bg-[rgb(55,54,54)]"
  );

  const rowClassName = cn(
    "flex-row items-start",
    isUser ? "justify-end" : "justify-start"
  );

  const userTextClassName = "text-[rgb(254,254,255)] dark:text-[rgb(23,23,23)] text-sm leading-[22px]";

  const markdownStyles = {
    body: { color: textColor, fontSize: 14, lineHeight: 22 },
    paragraph: { marginTop: 0, marginBottom: 4 },
    strong: { fontWeight: "700" as const },
    em: { fontStyle: "italic" as const },
    code_inline: {
      backgroundColor: codeBlockBg,
      color: textColor,
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: "monospace",
      fontSize: 13,
    },
    fence: { backgroundColor: codeBlockBg, borderRadius: 8, padding: 10, marginVertical: 4 },
    code_block: { backgroundColor: codeBlockBg, borderRadius: 8, padding: 10, fontFamily: "monospace", fontSize: 13 },
    bullet_list: { marginVertical: 2 },
    ordered_list: { marginVertical: 2 },
    list_item: { marginVertical: 1 },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: isDark ? "rgb(116,116,116)" : "rgb(162,163,163)",
      paddingLeft: 8,
      marginVertical: 4,
      opacity: 0.8,
    },
  };

  if (isLoading) {
    return (
      <Box className="flex-row items-start">
        <BotAvatar />
        <Box className={bubbleClassName}>
          <TypingDots />
        </Box>
      </Box>
    );
  }

  if (typeof content === "string") {
    return (
      <Box className={rowClassName}>
        {!isUser && <BotAvatar />}
        <Box className={bubbleClassName}>
          {isUser ? (
            <Text className={userTextClassName}>{content}</Text>
          ) : (
            <Markdown style={markdownStyles}>{content}</Markdown>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={rowClassName}>
      {!isUser && <BotAvatar />}
      <Box className={bubbleClassName}>
        <VStack space="xs">
          {content.map((part, i) => {
            if (part.type === "image_url") {
              return (
                <Image
                  key={i}
                  source={{ uri: part.image_url.url }}
                  style={{ width: 200, height: 150, borderRadius: 8 }}
                  contentFit="cover"
                />
              );
            }
            if (part.type === "text" && part.text) {
              return isUser ? (
                <Text key={i} className={userTextClassName}>{part.text}</Text>
              ) : (
                <Markdown key={i} style={markdownStyles}>{part.text}</Markdown>
              );
            }
            return null;
          })}
        </VStack>
      </Box>
    </Box>
  );
};

export default ChatBubble;
