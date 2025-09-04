"use client"

import { useMemo, useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { parsePhoneNumberFromString } from "libphonenumber-js/min"
import { api } from "../../services/api"

const DEFAULT_REGION = "IN"

function normalize(input: string): string | null {
  const trimmed = input.replace(/[^\d+]/g, "")
  try {
    const pn = trimmed.startsWith("+")
      ? parsePhoneNumberFromString(trimmed)
      : parsePhoneNumberFromString(trimmed, DEFAULT_REGION as any)
    return pn?.isValid() ? pn.number : null
  } catch {
    return null
  }
}

export default function ChangeNumberRequestScreen({ navigation }: any) {
  const [raw, setRaw] = useState("")
  const e164 = useMemo(() => normalize(raw), [raw])
  const [loading, setLoading] = useState(false)
  const canSend = !!e164

  const submit = async () => {
    if (!e164) return
    try {
      setLoading(true)
      await api.post("/profile/update-number", { newPhoneNumber: e164 })
      Alert.alert("OTP sent", "We sent an OTP to your new number.")
      navigation.navigate("ChangeNumberVerify", { phone: e164 })
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to request number update.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Change Phone Number</Text>
        <Text style={styles.sub}>Enter your new phone number. We’ll send an OTP to verify.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>New Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91XXXXXXXXXX"
            value={raw}
            onChangeText={setRaw}
            keyboardType="phone-pad"
          />
          {!!raw && !e164 && <Text style={styles.helpErr}>Enter a valid number (E.164)</Text>}
        </View>

        <TouchableOpacity
          style={[styles.btn, !canSend && styles.btnDisabled]}
          onPress={submit}
          disabled={!canSend || loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Send OTP</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  sub: { color: "#6B7280", marginTop: 6 },
  field: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#F3F4F6", borderRadius: 10, padding: 12, fontSize: 16, color: "#111827" },
  helpErr: { color: "#EF4444", marginTop: 6 },
  btn: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },
})
