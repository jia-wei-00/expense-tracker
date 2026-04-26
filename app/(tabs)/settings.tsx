import React from "react";
import { ButtonText, Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { useAuthStore } from "@/store/useAuth";
import { useTranslation } from "react-i18next";
import ActionSheet from "@/components/shared/ActionSheet";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";

const Settings = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const logout = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t } = useTranslation("auth");
  const toast = useToast();

  const handleToggle = () => {
    setIsOpened((state) => !state);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>{t("error.logout")}</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  return (
    <>
      <Center className="my-auto">
        <Button
          variant="solid"
          size="md"
          action="primary"
          onPress={() => setIsOpened(true)}
        >
          <ButtonText>{t("logout")}</ButtonText>
        </Button>
      </Center>
      <ActionSheet
        title={t("logout.title")}
        isOpen={isOpened}
        onClose={() => setIsOpened(false)}
        description={t("logout.description")}
        isLoading={isLoading}
        primaryButtonLabel={t(isLoading ? "logout.loading" : "logout")}
        primaryButtonAction={handleLogout}
        secondaryButtonLabel={t("cancel")}
        secondaryButtonAction={handleToggle}
      />
    </>
  );
};

export default Settings;
