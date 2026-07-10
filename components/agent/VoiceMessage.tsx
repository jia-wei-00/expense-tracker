import React from "react";
import { Pressable } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Play, Pause } from "lucide-react-native";
import { IVoiceMessage } from "@/types/components/agent/voice-message";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VoiceMessage = ({ url, isUser }: IVoiceMessage) => {
  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const duration = status.duration ?? 0;
  const position = status.currentTime ?? 0;
  const elapsed = isPlaying || position > 0 ? position : duration;

  const toggle = () => {
    if (isPlaying) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (duration > 0 && position >= duration)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <Pressable onPress={toggle}>
      <HStack space="sm" className="items-center py-0.5 pr-2">
        <Box
          className={cn(
            "h-8 w-8 items-center justify-center rounded-full",
            isUser ? "bg-white/25 dark:bg-black/10" : "bg-background-300",
          )}
        >
          <Icon
            as={isPlaying ? Pause : Play}
            size="sm"
            className={
              isUser
                ? "text-[rgb(254,254,255)] dark:text-[rgb(23,23,23)]"
                : "text-typography-700"
            }
          />
        </Box>
        <Text
          size="sm"
          className={cn(
            "tabular-nums",
            isUser
              ? "text-[rgb(254,254,255)] dark:text-[rgb(23,23,23)]"
              : "text-typography-700",
          )}
        >
          {formatTime(elapsed)}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default VoiceMessage;
