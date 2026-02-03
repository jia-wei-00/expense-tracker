import ControlledInput from "@/components/shared/ControlledInput";
import { ButtonText, Button, ButtonSpinner } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { loginSchema, TLoginSchema } from "@/schemas/login-schema";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@/components/ui/box";
import { useAuthStore } from "@/store/useAuth";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Heading } from "@/components/ui/heading";
import { InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";

const Login = () => {
  const { t } = useTranslation("auth");
  const methods = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const login = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const onSubmit = async () => {
    await login({
      email: methods.getValues("email"),
      password: methods.getValues("password"),
    });
  };

  const handleToggleShowPassword = () => {
    setShowPassword((state) => !state);
  };

  return (
    <View className="my-auto">
      <Box className="rounded-lg border-solid p-5 mx-4">
        <VStack space="md">
          <Heading size="lg" className="text-center mb-3">
            {t("login")}
          </Heading>
          <FormProvider {...methods}>
            <ControlledInput label={t("email")} name="email" />
            <ControlledInput
              label={t("password")}
              name="password"
              type={showPassword ? "text" : "password"}
              suffix={{
                onPress: handleToggleShowPassword,
                icon: showPassword ? EyeIcon : EyeOffIcon,
              }}
            />
            <Button
              variant="solid"
              size="md"
              action="primary"
              className="mt-5 rounded-full gap-4"
              onPress={methods.handleSubmit(onSubmit)}
              disabled={isLoading || !methods.formState.isValid}
            >
              {isLoading && <ButtonSpinner color="gray" />}
              <ButtonText>
                {t(isLoading ? "login.loading" : "login")}
              </ButtonText>
            </Button>
          </FormProvider>
        </VStack>
      </Box>
    </View>
  );
};

export default Login;
