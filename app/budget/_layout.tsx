import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function BudgetLayout() {
  const { t } = useTranslation("budget");

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t("title") }} />
    </Stack>
  );
}
