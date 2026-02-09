import { Tabs } from "expo-router";
import React, { use, useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSessionStore } from "@/store/useSession";
import { useExpenseSubscription } from "@/hooks/useExpenseSubscription";
import { Icon } from "@/components/ui/icon";
import { LayoutDashboard, PlusCircle, Settings } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userId = useSessionStore((state) => state.getUserId());
  const { subscribeToExpense } = useExpenseSubscription();

  useEffect(() => {
    if (!userId) return;
    subscribeToExpense.subscribe();

    return () => {
      subscribeToExpense.unsubscribe();
    };
  }, [userId]);

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
          title: "Home",
          tabBarIcon: ({ color }) => <Icon as={LayoutDashboard} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => <Icon as={PlusCircle} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Icon as={Settings} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Icon as={Settings} />,
        }}
      />
    </Tabs>
  );
}
