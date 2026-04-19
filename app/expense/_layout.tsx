import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ExpenseLayout() {
  const { t } = useTranslation("common");

  return (
    <Stack>
      <Stack.Screen name="add" options={{ title: t("expense.add") }} />
    </Stack>
  );
}
