import { VStack } from "@/components/ui/vstack";
import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import LoginForm from "@/components/login/LoginForm";
import SignupForm from "@/components/login/SignupForm";

type AuthView = "login" | "signup" | "check-email";

const Login = () => {
  const { t } = useTranslation("auth");
  const [view, setView] = useState<AuthView>("login");

  return (
    <View className="my-auto">
      <Box className="rounded-lg border-solid p-5 mx-4">
        <VStack space="md">
          {view === "login" && (
            <>
              <Heading size="lg" className="text-center mb-3">
                {t("login")}
              </Heading>
              <LoginForm />
              <Button
                variant="link"
                size="sm"
                onPress={() => setView("signup")}
              >
                <ButtonText className="text-typography-500">
                  {t("noAccount")}
                </ButtonText>
              </Button>
            </>
          )}

          {view === "signup" && (
            <>
              <Heading size="lg" className="text-center mb-3">
                {t("signup")}
              </Heading>
              <SignupForm onSuccess={() => setView("check-email")} />
              <Button
                variant="link"
                size="sm"
                onPress={() => setView("login")}
              >
                <ButtonText className="text-typography-500">
                  {t("haveAccount")}
                </ButtonText>
              </Button>
            </>
          )}

          {view === "check-email" && (
            <VStack space="md" className="items-center py-4">
              <Heading size="lg" className="text-center">
                {t("checkEmail.title")}
              </Heading>
              <Text className="text-typography-500 text-center text-sm leading-relaxed">
                {t("checkEmail.description")}
              </Text>
              <Button
                variant="link"
                size="sm"
                onPress={() => setView("login")}
              >
                <ButtonText>{t("backToLogin")}</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </View>
  );
};

export default Login;
