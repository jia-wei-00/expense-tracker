import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function RecurringLayout() {
  const { t } = useTranslation("recurring");

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t("title") }} />
    </Stack>
  );
}
