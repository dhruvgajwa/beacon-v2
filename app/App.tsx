"use client"
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme as NavTheme,
  type LinkingOptions,
} from "@react-navigation/native"
import type React from "react"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import * as Notifications from "expo-notifications"
import type { RootParamList } from "./types/navigation"
import { analytics } from "./services/analytics"

// Screens
import LoginNativeWidgetScreen from "./screens/auth/LoginNativeWidgetScreen"
import CreateProfileScreen from "./screens/profile/CreateProfileScreen"
import EditProfileScreen from "./screens/profile/EditProfileScreen"
import ChangeNumberRequestScreen from "./screens/profile/ChangeNumberRequestScreen"
import ChangeNumberVerifyScreen from "./screens/profile/ChangeNumberVerifyScreen"
import AcceptInviteScreen from "./screens/invite/AcceptInviteScreen"
import MainTabNavigator from "./navigation/MainTabNavigator"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import ImportContactsScreen from "./screens/onboarding/ImportContactsScreen"
import ContactsConnectScreen from "./screens/onboarding/ContactsConnectScreen"
import { useEffect, useMemo, useState } from "react"
import { getContactsImportedFlag } from "./services/contacts"
import { registerForPushNotificationsAsync } from "./services/push"
import { navigationRef } from "./navigation/navigation"
import { ThemeProvider, useTheme, useThemeColors } from "./contexts/ThemeContext"

const Stack = createNativeStackNavigator()

const linking: LinkingOptions<RootParamList> = {
  prefixes: ["https://beacon.app", "beacon://"],
  config: {
    screens: {
      AcceptInvite: { path: "invite", parse: { token: (t: any) => String(t) } },
    },
  },
}

function ThemedNavContainer({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme()
  const colors = useThemeColors()
  // Bridge ThemeContext colors to React Navigation theme
  const navTheme: NavTheme = useMemo(
    () => ({
      dark: mode === "dark",
      colors: {
        ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.tabActive,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.tabActive,
      },
    }),
    [mode, colors],
  )

  return (
    <>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
        {children}
      </NavigationContainer>
    </>
  )
}

const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [contactsImported, setContactsImported] = useState<boolean | null>(null)

  useEffect(() => {
    void analytics.init(user?.id)
    ;(async () => {
      const flag = await getContactsImportedFlag()
      setContactsImported(flag)
    })()
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().catch(() => {})
      const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
        try {
          const data = resp.notification.request.content.data as any
          if (data?.requestId) {
            navigationRef.isReady() && navigationRef.navigate("Pings" as never, { focusId: data.requestId } as never)
            void analytics.track("push_open", { requestId: data?.requestId })
          }
        } catch {
          // ignore
        }
      })
      return () => sub.remove()
    }
  }, [isAuthenticated])

  if (isLoading || contactsImported === null) {
    return null
  }

  const needProfile = isAuthenticated && !user?.name
  const needContactsImport = isAuthenticated && user?.name && !contactsImported

  return (
    <ThemedNavContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="LoginNative" component={LoginNativeWidgetScreen} />
          </>
        ) : needProfile ? (
          <>
            <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
          </>
        ) : needContactsImport ? (
          <>
            <Stack.Screen name="ImportContacts" component={ImportContactsScreen} />
            <Stack.Screen name="ContactsConnect" component={ContactsConnectScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: true, title: "Edit Profile" }}
            />
            <Stack.Screen
              name="ChangeNumberRequest"
              component={ChangeNumberRequestScreen}
              options={{ headerShown: true, title: "Change Number" }}
            />
            <Stack.Screen
              name="ChangeNumberVerify"
              component={ChangeNumberVerifyScreen}
              options={{ headerShown: true, title: "Verify Number" }}
            />
            <Stack.Screen
              name="AcceptInvite"
              component={AcceptInviteScreen}
              options={{ headerShown: true, title: "Accept Invite" }}
            />
          </>
        )}
      </Stack.Navigator>
    </ThemedNavContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
