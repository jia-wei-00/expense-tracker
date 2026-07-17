import React from "react";
import { Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ISettingsLink } from "@/types/components/settings/settings-link";

const SettingsLink = ({ label, icon, onPress }: ISettingsLink) => {
  return (
    <Box className="rounded-2xl bg-background-0 overflow-hidden">
      <Pressable onPress={onPress}>
        <HStack className="p-5 items-center justify-between">
          <HStack className="items-center" space="sm">
            <Icon as={icon} className="text-typography-700" size="sm" />
            <Text bold size="md">
              {label}
            </Text>
          </HStack>
          <Icon as={ChevronRight} className="text-typography-500" size="sm" />
        </HStack>
      </Pressable>
    </Box>
  );
};

export default SettingsLink;
