import ControlledInput from "@/components/shared/ControlledInput";
import { ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { loginSchema, TLoginSchema } from "@/schemas/login-schema";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Button } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

const Login = () => {
  const methods = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = () => {
    console.log("submitted");
  };

  return (
    <View className="my-auto">
      <Box className="rounded-lg bg-background-50 p-5 mx-4">
        <VStack>
          <FormProvider {...methods}>
            <ControlledInput label="Email" name="email" />
            <ControlledInput label="Password" name="password" type="password" />
            <Button
              // className="mt-4"
              variant="outlined"
              onPress={methods.handleSubmit(onSubmit)}
            >
              Submit
            </Button>
          </FormProvider>
        </VStack>
      </Box>
    </View>
  );
};

export default Login;
