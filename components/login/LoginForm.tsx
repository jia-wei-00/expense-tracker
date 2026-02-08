import React from "react";
import ControlledInput from "@/components/shared/ControlledInput";
import { ButtonText, Button, ButtonSpinner } from "@/components/ui/button";
import { loginSchema, TLoginSchema } from "@/types/page/login-schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuth";
import { Icon } from "@/components/ui/icon";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const LoginForm = () => {
  const methods = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const login = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t } = useTranslation("auth");

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
    <FormProvider {...methods}>
      <ControlledInput label={t("email")} name="email" />
      <ControlledInput
        label={t("password")}
        name="password"
        type={showPassword ? "text" : "password"}
        suffix={{
          onPress: handleToggleShowPassword,
          icon: showPassword ? Eye : EyeOff,
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
        <ButtonText>{t(isLoading ? "login.loading" : "login")}</ButtonText>
      </Button>
    </FormProvider>
  );
};

export default LoginForm;
