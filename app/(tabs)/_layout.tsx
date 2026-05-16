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
        // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          tabBarIcon: ({ color }) => <Icon as={LayoutDashboard} />,
        }}
      />
      <Tabs.Screen
        name="loan"
        options={{
          title: t("tab.loan"),
          tabBarIcon: ({ color }) => <Icon as={CreditCard} />,
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: t("tab.agent"),
          tabBarIcon: ({ color }) => <Icon as={Bot} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tab.explore"),
          tabBarIcon: ({ color }) => <Icon as={History} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tab.settings"),
          tabBarIcon: ({ color }) => <Icon as={Settings} />,
        }}
      />
    </Tabs>
  );
}
