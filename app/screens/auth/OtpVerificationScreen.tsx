"use client"

import { useEffect, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { analytics } from "../../services/analytics"
import { api } from "../../services/api"

type Props = {
  route?: {
    params?: {
      userId: string
      flow?: "signup" | "login"
      phone?: string
    }
  }
  navigation?: any
}

export default function OtpVerificationScreen({ route, navigation }: Props) {
  const userId = route?.params?.userId || ""
  const flow = route?.params?.flow || "login"

  const [otp, setOtp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    analytics.screenView("OtpVerification")
  }, [])

  const verify = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid code", "Enter the 4-digit code.")
      return
    }
    setSubmitting(true)
    analytics.track("otp_verify_submit", { flow })
    try {
      const endpoint = flow === "signup" ? "/auth/verify-otp-signup" : "/auth/verify-otp-login"
      const { data } = await api.post(endpoint, { userId, otp })
      analytics.track("otp_verify_success", { flow })
      // set user in analytics for subsequent events
      await analytics.init(data?.user?.id)
      Alert.alert("Verified", "You are logged in.")
      navigation?.replace?.("MainTabs")
    } catch (e: any) {
      analytics.track("otp_verify_error", { flow, code: e?.response?.status })
      Alert.alert("Verification failed", e?.response?.data?.message || "Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setResending(true)
    analytics.track("otp_resend_submit", { flow })
    try {
      const phone = route?.params?.phone
      const endpoint = flow === "signup" ? "/auth/resend-otp-signup" : "/auth/resend-otp-login"
      await api.post(endpoint, { phoneNumber: phone })
      analytics.track("otp_resend_success", { flow })
      Alert.alert("OTP sent", "A new code has been sent.")
    } catch (e: any) {
      analytics.track("otp_resend_error", { flow, code: e?.response?.status })
      Alert.alert("Resend failed", e?.response?.data?.message || "Try again later.")
    } finally {
      setResending(false)
    }
  }

  return (
    <View style={styles.container} accessibilityLabel="otp-verification-screen">
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>We sent a 4-digit code to your phone.</Text>
      <TextInput
        style={styles.input}
        placeholder="1234"
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
        accessibilityLabel="otp-input"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={verify}
        disabled={submitting}
        accessibilityLabel="verify-button"
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.linkButton, resending && styles.buttonDisabled]}
        onPress={resend}
        disabled={resending}
        accessibilityLabel="resend-button"
      >
        {resending ? <ActivityIndicator /> : <Text style={styles.linkText}>Resend code</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 6,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  linkButton: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#4B5563", textDecorationLine: "underline" },
})
