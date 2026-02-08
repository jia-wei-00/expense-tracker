import { VStack } from "@/components/ui/vstack";
import React from "react";
import { Box } from "@/components/ui/box";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/ui/heading";
import LoginForm from "@/components/login/LoginForm";

const Login = () => {
  const { t } = useTranslation("auth");

  return (
    <View className="my-auto">
      <Box className="rounded-lg border-solid p-5 mx-4">
        <VStack space="md">
          <Heading size="lg" className="text-center mb-3">
            {t("login")}
          </Heading>
          <LoginForm />
        </VStack>
      </Box>
    </View>
  );
};

export default Login;
