import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import { Lock } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppLockStore } from "@/store/useAppLock";
import { IAppLockGate } from "@/types/components/shared/app-lock-gate";

const AppLockGate = ({ children }: IAppLockGate) => {
  const { t } = useTranslation("settings");
  const enabled = useAppLockStore((state) => state.enabled);
  const [locked, setLocked] = useState(enabled);
  // The biometric prompt itself can background the app on Android; don't
  // re-lock while it is showing.
  const isAuthenticating = useRef(false);
  // Refs so the AppState listener always sees the latest values
  const lockedRef = useRef(locked);
  const unlockRef = useRef<() => void>(() => {});

  const unlock = useCallback(async () => {
    // Prompting while backgrounded never resolves and wedges the gate —
    // only prompt when the app is in the foreground.
    if (isAuthenticating.current || AppState.currentState !== "active") return;
    isAuthenticating.current = true;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("applock.prompt"),
      });
      if (result.success) setLocked(false);
    } finally {
      isAuthenticating.current = false;
    }
  }, [t]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    unlockRef.current = unlock;
  }, [unlock]);

  // Cold start: prompt as soon as the gate mounts locked
  useEffect(() => {
    if (enabled && locked) unlock();
  }, [enabled, locked, unlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (!useAppLockStore.getState().enabled) return;
      if (state === "background" && !isAuthenticating.current) {
        setLocked(true);
      } else if (state === "active" && lockedRef.current) {
        // Returning to a locked app: trigger biometrics right away
        unlockRef.current();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <Box className="flex-1">
      {children}
      {enabled && locked && (
        <Box className="absolute inset-0 z-50 bg-background-0">
          <Center className="flex-1 gap-4 px-10">
            <Icon as={Lock} size="xl" className="text-typography-500" />
            <Text bold size="lg">
              {t("applock.locked")}
            </Text>
            <Button className="rounded-full w-full" size="md" onPress={unlock}>
              <ButtonText>{t("applock.unlock")}</ButtonText>
            </Button>
          </Center>
        </Box>
      )}
    </Box>
  );
};

export default AppLockGate;
