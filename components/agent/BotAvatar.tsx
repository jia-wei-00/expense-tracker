import React from "react";
import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import { Bot } from "lucide-react-native";

const BotAvatar = () => (
  <Box className="w-[30px] h-[30px] rounded-full items-center justify-center mr-2 mt-0.5 shrink-0 bg-[rgb(228,228,228)] dark:bg-[rgb(60,59,59)]">
    <Icon as={Bot} size="xs" />
  </Box>
);

export default BotAvatar;
