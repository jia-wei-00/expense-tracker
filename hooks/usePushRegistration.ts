import { useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/useSession";
import { isExpensePushPayload } from "@/lib/expensePush";

// Foreground behaviour: keep it quiet — the open app already updates live via
// the Realtime expense subscription, so we don't double up with a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const getProjectId = (): string | undefined =>
  Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const routeFromNotification = (data: unknown) => {
  // Expense added/updated from WhatsApp → show the summary screen, passing the
  // payload through as a serialized route param.
  if (isExpensePushPayload(data)) {
    router.push({
      pathname: "/expense/notification-summary",
      params: { payload: JSON.stringify(data) },
    });
  }
};

export async function registerForPush(): Promise<void> {
  if (Platform.OS === "web" || !Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  console.log("[push] start — platform:", Platform.OS, "isDevice:", Device.isDevice);

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  console.log("[push] permission status:", status);
  if (status !== "granted") return;

  const projectId = getProjectId();
  console.log("[push] projectId:", projectId);
  if (!projectId) return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  console.log("[push] got token:", token);

  // No-op server-side if the user hasn't linked WhatsApp (no row yet).
  const { error } = await supabase.rpc("set_push_token", {
    p_token: token,
    p_platform: Platform.OS,
  });
  console.log("[push] set_push_token rpc error:", error ?? "none");
}

/**
 * Registers this device's Expo push token against the signed-in user's
 * whatsapp_users row, and deep-links notification taps to the expense detail.
 * Mounted from the authenticated tabs layout.
 */
export function usePushRegistration() {
  const userId = useSessionStore((state) => state.getUserId());

  useEffect(() => {
    if (!userId) return;
    registerForPush().catch((err) =>
      console.log("[push] registration failed:", err?.message ?? err),
    );
  }, [userId]);

  useEffect(() => {
    // Tap while app is running/backgrounded.
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => routeFromNotification(response.notification.request.content.data),
    );

    // Tap that cold-started the app.
    const res = Notifications.getLastNotificationResponse();
    if (res) routeFromNotification(res.notification.request.content.data);

    return () => sub.remove();
  }, []);
}
