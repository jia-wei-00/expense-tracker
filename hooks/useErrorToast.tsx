import React from "react";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";

export const useErrorToast = () => {
  const toast = useToast();

  const showError = (message: string) => {
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="error">
          <ToastTitle>{message}</ToastTitle>
        </Toast>
      ),
    });
  };

  return { showError };
};
