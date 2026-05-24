import React from "react";
import ControlledInput from "@/components/shared/ControlledInput";
import { ButtonText, Button, ButtonSpinner } from "@/components/ui/button";
import { signupSchema, TSignupSchema } from "@/types/page/signup-schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuth";
import { Eye, EyeOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useErrorToast } from "@/hooks/useErrorToast";
import { ISignupForm } from "@/types/components/login/signup-form";

const SignupForm = ({ onSuccess }: ISignupForm) => {
  const methods = useForm<TSignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isAuthLoading);

  const { t } = useTranslation("auth");
  const { showError } = useErrorToast();

  const onSubmit = async (values: TSignupSchema) => {
    try {
      const result = await signUp({ email: values.email, password: values.password });
      if (result.needsEmailConfirmation) {
        onSuccess();
      }
    } catch {
      showError(t("error.signup"));
    }
  };

  return (
    <FormProvider {...methods}>
      <ControlledInput label={t("email")} name="email" />
      <ControlledInput
        label={t("password")}
        name="password"
        type={showPassword ? "text" : "password"}
        suffix={{
          onPress: () => setShowPassword((s) => !s),
          icon: showPassword ? Eye : EyeOff,
        }}
      />
      <ControlledInput
        label={t("confirmPassword")}
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        suffix={{
          onPress: () => setShowConfirmPassword((s) => !s),
          icon: showConfirmPassword ? Eye : EyeOff,
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
        <ButtonText>{t(isLoading ? "signup.loading" : "signup")}</ButtonText>
      </Button>
    </FormProvider>
  );
};

export default SignupForm;
