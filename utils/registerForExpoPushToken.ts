import * as Device from "expo-device";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";

import { shouldDeferExpoNotifications } from "@/utils/expoNotificationsGate";

export type PushRegistrationLoadingCallbacks = {
  setPageLoading: (v: boolean) => void;
  setLoadingText: (v: string) => void;
};

/**
 * Registers for Expo push token. Returns "" in Expo Go or on failure.
 * Uses dynamic `import("expo-notifications")` so Expo Go never loads the native module.
 */
export async function registerForExpoPushTokenAsync({
  setPageLoading,
  setLoadingText,
}: PushRegistrationLoadingCallbacks): Promise<string> {
  if (shouldDeferExpoNotifications()) {
    console.warn(
      "[push] Skipping in Expo Go; use an EAS development or production build for push tokens."
    );
    return "";
  }

  let Notifications: typeof import("expo-notifications");
  try {
    Notifications = await import("expo-notifications");
  } catch (e) {
    console.warn("[push] expo-notifications failed to load", e);
    return "";
  }

  try {
    setPageLoading(true);
    setLoadingText("Getting notification token");
    let token = "";

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Toast.show({
          type: "error",
          text1: "Oops!",
          text2: "Failed to get push token for push notification!",
        });
        return "";
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        Toast.show({
          type: "error",
          text1: "Oops!",
          text2: "Project ID not found",
        });
        console.log("Project ID not found");
        return "";
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("[push] Expo push token", token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  } catch (error) {
    console.log(error);
    Toast.show({
      type: "error",
      text1: "Oops!",
      text2: "Problems while getting notification token",
    });
    return "";
  } finally {
    setPageLoading(false);
    setLoadingText("Loading");
  }
}

/**
 * Resolve push token immediately before login POST without toggling the screen’s
 * main loading overlay (avoids racing the background `getNotificationToken()` call).
 */
export async function resolveExpoPushTokenForLoginAsync(): Promise<string> {
  return registerForExpoPushTokenAsync({
    setPageLoading: () => {},
    setLoadingText: () => {},
  });
}
