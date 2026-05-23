import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenseSubscription } from "@/hooks/useExpenseSubscription";
import { Icon } from "@/components/ui/icon";
import {
  LayoutDashboard,
  CreditCard,
  History,
  Settings,
  Bot,
} from "lucide-react-native";
import { useCategorySubscription } from "@/hooks/useCategorySubscription";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation("common");
  useExpenseSubscription();
  useCategorySubscription();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#ffffff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color }) => <Icon as={LayoutDashboard} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="loan"
        options={{
          title: t("tab.loan"),
          tabBarIcon: ({ color }) => <Icon as={CreditCard} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: t("tab.agent"),
          tabBarIcon: ({ color }) => <Icon as={Bot} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tab.explore"),
          tabBarIcon: ({ color }) => <Icon as={History} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab.settings"),
          tabBarIcon: ({ color }) => <Icon as={Settings} style={{ color }} />,
        }}
      />
    </Tabs>
  );
}
