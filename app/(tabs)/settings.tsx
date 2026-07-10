import React from "react";
import { RefreshControl } from "react-native";
import { ButtonText, Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuth";
import { useTranslation } from "react-i18next";
import ActionSheet from "@/components/shared/ActionSheet";
import { useErrorToast } from "@/hooks/useErrorToast";
import Container from "@/components/shared/Container";
import LanguageSwitcher from "@/components/settings/LanguageSwitcher";
import ThemeSwitcher from "@/components/settings/ThemeSwitcher";
import WhatsAppRegistration from "@/components/settings/WhatsAppRegistration";
import { VStack } from "@/components/ui/vstack";
import { useWhatsAppUser } from "@/hooks/useWhatsApp";

const Settings = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const logout = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t: tAuth } = useTranslation("auth");
  const { t } = useTranslation("settings");
  const { showError } = useErrorToast();
  const { refetch, isFetching } = useWhatsAppUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showError(tAuth("error.logout"));
    }
  };

  return (
    <>
      <Container
        title={t("title")}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        <VStack space="md" className="flex-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <WhatsAppRegistration />
        </VStack>
        <Button
          variant="solid"
          size="md"
          action="primary"
          className="rounded-full mb-4 mt-4"
          onPress={() => setIsOpened(true)}
        >
          <ButtonText>{tAuth("logout")}</ButtonText>
        </Button>
      </Container>
      <ActionSheet
        title={tAuth("logout.title")}
        isOpen={isOpened}
        onClose={() => setIsOpened(false)}
        description={tAuth("logout.description")}
        isLoading={isLoading}
        primaryButtonLabel={tAuth(isLoading ? "logout.loading" : "logout")}
        primaryButtonAction={handleLogout}
        secondaryButtonLabel={tAuth("cancel")}
        secondaryButtonAction={() => setIsOpened(false)}
      />
    </>
  );
};

export default Settings;
