import React, { useState } from "react";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Divider } from "@/components/ui/divider";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { CircleIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import storage from "@/lib/storage";

const LANGUAGES = [
  { value: "en-US", labelKey: "language.english" },
  { value: "zh-CN", labelKey: "language.chinese" },
] as const;

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("settings");
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLang = i18n.language;

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    storage.setItem("language", lang);
  };

  const currentLabel =
    LANGUAGES.find((l) => l.value === currentLang)?.labelKey ?? "language.english";

  return (
    <Box className="rounded-2xl bg-background-0 overflow-hidden">
      <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
        <HStack className="p-5 items-center justify-between">
          <Text bold size="md">
            {t("language.label")}
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
          <RadioGroup value={currentLang} onChange={handleChange}>
            <VStack space="sm">
              {LANGUAGES.map(({ value, labelKey }) => (
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

export default LanguageSwitcher;
