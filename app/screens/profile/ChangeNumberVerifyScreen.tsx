"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { api } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

export default function ChangeNumberVerifyScreen({ route, navigation }: any) {
  const { updateUser } = useAuth()
  const phone: string = route?.params?.phone
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const canVerify = /^\d{4,8}$/.test(otp)

  const submit = async () => {
    try {
      setLoading(true)
      const res = await api.post("/profile/verify-OTP-update-number", { otp })
      const newPhone = res.data?.phoneNumber || phone
      updateUser({ phoneNumber: newPhone })
      Alert.alert("Updated", "Your phone number has been updated.")
      navigation.goBack()
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to verify OTP.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify New Number</Text>
        <Text style={styles.sub}>Enter the OTP sent to {phone}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={8}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, !canVerify && styles.btnDisabled]}
          onPress={submit}
          disabled={!canVerify || loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Verify</Text>}
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
