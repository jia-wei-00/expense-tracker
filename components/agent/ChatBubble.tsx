import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { IChatBubble } from "@/types/components/agent/chat-bubble";

const ChatBubble = ({ role, content, isLoading }: IChatBubble) => {
  const isUser = role === "user";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Theme colors sourced from gluestack-ui-provider/config.ts
  const userBg = isDark ? "rgb(230,230,230)" : "rgb(51,51,51)";
  const userText = isDark ? "rgb(23,23,23)" : "rgb(254,254,255)";
  const assistantBg = isDark ? "rgb(65,64,64)" : "rgb(242,241,241)";
  const assistantText = isDark ? "rgb(254,254,255)" : "rgb(38,38,39)";
  const codeBlockBg = isDark ? "rgb(39,38,37)" : "rgb(220,219,219)";

  const textColor = isUser ? userText : assistantText;

  const bubbleStyle = {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: isUser ? userBg : assistantBg,
    ...(isUser
      ? { borderBottomRightRadius: 4 }
      : { borderBottomLeftRadius: 4 }),
  };

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
    fence: {
      backgroundColor: codeBlockBg,
      borderRadius: 8,
      padding: 10,
      marginVertical: 4,
    },
    code_block: {
      backgroundColor: codeBlockBg,
      borderRadius: 8,
      padding: 10,
      fontFamily: "monospace",
      fontSize: 13,
    },
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
      <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
        <View style={[bubbleStyle, { maxWidth: "80%" }]}>
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  if (typeof content === "string") {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <View style={[bubbleStyle, { maxWidth: "80%" }]}>
          {isUser ? (
            <Text style={{ color: textColor, fontSize: 14, lineHeight: 22 }}>
              {content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>{content}</Markdown>
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <View style={[bubbleStyle, { maxWidth: "80%" }]}>
        <VStack space="xs">
          {content.map((part, i) => {
            if (part.type === "image") {
              return (
                <Image
                  key={i}
                  source={{ uri: part.url }}
                  style={{ width: 200, height: 150, borderRadius: 8 }}
                  contentFit="cover"
                />
              );
            }
            if (part.type === "text" && part.text) {
              return isUser ? (
                <Text
                  key={i}
                  style={{ color: textColor, fontSize: 14, lineHeight: 22 }}
                >
                  {part.text}
                </Text>
              ) : (
                <Markdown key={i} style={markdownStyles}>
                  {part.text}
                </Markdown>
              );
            }
            return null;
          })}
        </VStack>
      </View>
    </View>
  );
};

export default ChatBubble;
