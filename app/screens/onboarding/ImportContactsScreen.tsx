"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { requestContactsPermission, loadDeviceContacts, saveContacts } from "../../services/contacts"

const ImportContactsScreen = ({ navigation }: any) => {
  const [checking, setChecking] = useState(false)
  const [denied, setDenied] = useState(false)

  const handleImport = async () => {
    setChecking(true)
    try {
      const granted = await requestContactsPermission()
      if (!granted) {
        setDenied(true)
        return
      }
      const contacts = await loadDeviceContacts()
      await saveContacts(contacts)
      navigation.replace("ContactsConnect")
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Failed to import contacts. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    // Auto attempt on load
    handleImport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openSettings = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:")
    } else {
      await Linking.openSettings()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!denied ? (
          <>
            <View style={styles.iconWrap}>
              <Ionicons name="people-circle" size={48} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Import your contacts</Text>
            <Text style={styles.subtitle}>
              Beacon connects you to people via your phone contacts. Allow access to continue. [It connects through
              contacts, per product design.]
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleImport} disabled={checking}>
              {checking ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Allow</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.iconWrapWarn}>
              <Ionicons name="alert-circle" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Contacts permission required</Text>
            <Text style={styles.subtitle}>
              You won&apos;t be able to use Beacon without importing contacts. The app connects people only through
              contacts.
            </Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleImport} disabled={checking}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={openSettings}>
              <Text style={styles.linkText}>Open Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconWrapWarn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#4B5563", textAlign: "center", marginBottom: 20 },
  primaryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: 160,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: 160,
    marginTop: 8,
  },
  secondaryButtonText: { color: "#111827", fontWeight: "600" },
  linkButton: { marginTop: 8 },
  linkText: { color: "#4F46E5", fontWeight: "600" },
})

export default ImportContactsScreen
