import React from "react";
import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import { Fingerprint } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useAppLockStore } from "@/store/useAppLock";
import { useErrorToast } from "@/hooks/useErrorToast";

const AppLockSwitch = () => {
  const { t } = useTranslation("settings");
  const { showError } = useErrorToast();
  const enabled = useAppLockStore((state) => state.enabled);
  const setEnabled = useAppLockStore((state) => state.setEnabled);

  const handleChange = async (value: boolean) => {
    if (!value) {
      setEnabled(false);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      showError(t("applock.unavailable"));
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t("applock.prompt"),
    });
    if (result.success) setEnabled(true);
  };

  return (
    <Box className="rounded-2xl bg-background-0 overflow-hidden">
      <HStack className="p-5 items-center justify-between">
        <HStack className="items-center" space="sm">
          <Icon as={Fingerprint} className="text-typography-700" size="sm" />
          <Text bold size="md">
            {t("applock.label")}
          </Text>
        </HStack>
        <Switch value={enabled} onValueChange={handleChange} />
      </HStack>
    </Box>
  );
};

export default AppLockSwitch;
