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
import { CURRENCIES } from "@/constants/currency";
import { useCurrencyStore } from "@/store/useCurrency";

const CurrencySwitcher = () => {
  const { t } = useTranslation("settings");
  const [isExpanded, setIsExpanded] = useState(false);

  const code = useCurrencyStore((state) => state.code);
  const symbol = useCurrencyStore((state) => state.symbol);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  return (
    <Box className="rounded-2xl bg-background-0 overflow-hidden">
      <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
        <HStack className="p-5 items-center justify-between">
          <Text bold size="md">
            {t("currency.label")}
          </Text>
          <HStack className="items-center" space="sm">
            <Text size="sm" className="text-typography-500">
              {code} ({symbol})
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
          <RadioGroup value={code} onChange={setCurrency}>
            <VStack space="sm">
              {CURRENCIES.map((currency) => (
                <Radio key={currency.code} value={currency.code} size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>
                    {currency.code} ({currency.symbol})
                  </RadioLabel>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </VStack>
      )}
    </Box>
  );
};

export default CurrencySwitcher;
