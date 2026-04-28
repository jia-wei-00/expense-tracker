import React from "react";
import { ButtonText, Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { useAuthStore } from "@/store/useAuth";
import { useTranslation } from "react-i18next";
import ActionSheet from "@/components/shared/ActionSheet";
import { useErrorToast } from "@/hooks/useErrorToast";

const Settings = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const logout = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t } = useTranslation("auth");
  const { showError } = useErrorToast();

  const handleToggle = () => {
    setIsOpened((state) => !state);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showError(t("error.logout"));
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
