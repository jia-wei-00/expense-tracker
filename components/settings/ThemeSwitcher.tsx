import React, { useState } from "react";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import {
  Icon,
  CircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { useThemeStore, isThemeMode } from "@/store/useTheme";

const THEMES = [
  { value: "light", labelKey: "theme.light" },
  { value: "dark", labelKey: "theme.dark" },
  { value: "system", labelKey: "theme.system" },
] as const;

const ThemeSwitcher = () => {
  const { t } = useTranslation("settings");
  const [isExpanded, setIsExpanded] = useState(false);

  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const handleChange = (value: string) => {
    if (isThemeMode(value)) setMode(value);
  };

  const currentLabel =
    THEMES.find((theme) => theme.value === mode)?.labelKey ?? "theme.dark";

  return (
    <Box className="rounded-2xl bg-background-0 overflow-hidden">
      <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
        <HStack className="p-5 items-center justify-between">
          <Text bold size="md">
            {t("theme.label")}
          </Text>
          <HStack className="items-center" space="sm">
            <Text size="sm" className="text-typography-500">
              {t(currentLabel)}
            </Text>
            <Icon
              as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              className="text-typography-500"
              size="sm"
            />
          </HStack>
        </HStack>
      </Pressable>

      {isExpanded && (
        <VStack className="px-5 pb-5" space="md">
          <Divider />
          <RadioGroup value={mode} onChange={handleChange}>
            <VStack space="sm">
              {THEMES.map(({ value, labelKey }) => (
                <Radio key={value} value={value} size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>{t(labelKey)}</RadioLabel>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </VStack>
      )}
    </Box>
  );
};

export default ThemeSwitcher;
