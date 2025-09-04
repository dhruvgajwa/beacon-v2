"use client"

import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import Constants from "expo-constants"
import { api } from "./api"

export async function registerForPushNotificationsAsync() {
  // iOS: ask permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== "granted") {
    return null
  }

  // Get Expo push token
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId || undefined
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
  const expoPushToken = tokenData.data

  // Register with backend
  const platform = Platform.OS === "ios" ? "ios" : "android"
  try {
    await api.post("/profile/register-device-token", {
      token: expoPushToken,
      platform,
      tokenType: "expo",
    })
  } catch (e) {
    // no-op
  }

  return expoPushToken
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})
