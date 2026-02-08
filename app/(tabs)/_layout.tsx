import { Tabs } from "expo-router";
import React, { use, useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSessionStore } from "@/store/useSession";
import { useExpenseSubscription } from "@/hooks/useExpenseSubscription";

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
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
