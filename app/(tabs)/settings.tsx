import React from "react";
import { View } from "react-native";
// import { Button, BottomSheet, Host, Text } from "@expo/ui/jetpack-compose";
import {
  Button as GlueButton,
  ButtonText,
  ButtonSpinner,
} from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { useAuthStore } from "@/store/useAuth";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/ui/heading";

const Settings = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const logout = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t } = useTranslation("auth");
  const handleToggle = () => {
    setIsOpened((state) => !state);
  };

  return (
    <>
      <Center className="my-auto">
        <GlueButton
          variant="solid"
          size="md"
          action="primary"
          onPress={() => setIsOpened(true)}
        >
          <ButtonText>Click me</ButtonText>
        </GlueButton>
      </Center>
      <Actionsheet isOpen={isOpened} onClose={() => setIsOpened(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading size="lg" className="my-3">
            {t("logout.title")}
          </Heading>
          <Text className="my-2">{t("logout.description")}</Text>
          <Button
            variant="solid"
            size="md"
            className="mt-5 rounded-full w-full"
            onPress={logout}
          >
            {isLoading && <ButtonSpinner color="gray" />}
            <ButtonText>
              {t(isLoading ? "logout.loading" : "logout")}
            </ButtonText>
          </Button>
          <Button
            variant="outline"
            size="md"
            className="mt-5 rounded-full w-full border-outline-0"
            onPress={handleToggle}
          >
            <ButtonText>{t("cancel")}</ButtonText>
          </Button>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

export default Settings;
