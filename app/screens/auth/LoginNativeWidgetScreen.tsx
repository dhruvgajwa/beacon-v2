"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import HiddenMsg91, { type HiddenMsg91Ref } from "../../components/auth/HiddenMsg91"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import { parsePhoneNumberFromString } from "libphonenumber-js/min"

// Default region India for inputs without +
const DEFAULT_REGION = "IN"

function toE164(input: string): { e164: string | null; display: string } {
  const cleaned = input.replace(/[^\d+]/g, "")
  try {
    const pn = cleaned.startsWith("+")
      ? parsePhoneNumberFromString(cleaned)
      : parsePhoneNumberFromString(cleaned, DEFAULT_REGION as any)
    if (pn?.isValid()) {
      return { e164: pn.number, display: pn.number } // display as E.164
    }
    return { e164: null, display: cleaned }
  } catch {
    return { e164: null, display: cleaned }
  }
}

export default function LoginNativeWidgetScreen() {
  const { signIn } = useAuth()
  const bridgeRef = useRef<HiddenMsg91Ref>(null)

  const [name, setName] = useState("")
  const [phoneInput, setPhoneInput] = useState("") // UI field value
  const [phoneE164, setPhoneE164] = useState<string | null>(null) // normalized E.164
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"send" | "verify">("send")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | undefined>(undefined)

  // Resend cooldown
  const [resendSecs, setResendSecs] = useState(0)

  const canSend = useMemo(() => !!name.trim() && !!phoneE164, [name, phoneE164])
  const canVerify = useMemo(() => /^\d{4,8}$/.test(otp), [otp])

  const handlePhoneChange = (val: string) => {
    // Enforce E.164 display with IN as default region
    const { e164, display } = toE164(val)
    setPhoneInput(display)
    setPhoneE164(e164)
    if (error) setError(null)
  }

  useEffect(() => {
    let t: any
    if (step === "verify" && resendSecs > 0) {
      t = setInterval(() => setResendSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    }
    return () => t && clearInterval(t)
  }, [step, resendSecs])

  const handleSend = async () => {
    setError(null)
    if (!bridgeRef.current?.ready) {
      setError("OTP widget is still loading. Please wait a moment.")
      return
    }
    if (!canSend || !phoneE164) {
      setError("Enter your name and a valid phone (e.g., +91XXXXXXXXXX)")
      return
    }
    try {
      setLoading(true)
      // MSG91 expects number without '+'
      const mobile = phoneE164.replace("+", "")
      const res = await bridgeRef.current.sendOtp(mobile)
      setRequestId(res.requestId)
      setStep("verify")
      setResendSecs(60) // start 60s cooldown
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendSecs > 0) return
    if (!bridgeRef.current?.ready || !phoneE164) {
      setError("OTP widget is still loading. Please wait a moment.")
      return
    }
    try {
      setLoading(true)
      const mobile = phoneE164.replace("+", "")
      const res = await bridgeRef.current.sendOtp(mobile)
      setRequestId(res.requestId)
      setResendSecs(60) // reset cooldown
    } catch (e: any) {
      setError(e?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError(null)
    if (!bridgeRef.current?.ready) {
      setError("OTP widget is still loading. Please wait a moment.")
      return
    }
    if (!canVerify) {
      setError("Enter the OTP you received")
      return
    }
    try {
      setLoading(true)
      const v = await bridgeRef.current.verifyOtp(otp, requestId)
      const tokenFromMsg91 = v.token
      // Exchange with backend for our JWT and user object
      const res = await api.post("/auth/msg91/verify", {
        token: tokenFromMsg91,
        name: name.trim(),
      })
      await signIn(res.data.token, res.data.user)
    } catch (e: any) {
      Alert.alert("Authentication failed", e?.response?.data?.message || e?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Beacon</Text>
            <Text style={styles.sub}>Login / Signup with OTP</Text>
          </View>

          {step === "send" && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91XXXXXXXXXX"
                  value={phoneInput}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <Text style={styles.helper}>Formatted to E.164 automatically (default region: India)</Text>
              </View>

              {/* Hidden MSG91 widget (CAPTCHA hidden) */}
              <HiddenMsg91 ref={bridgeRef} showCaptcha={false} captchaHeight={0} onError={(msg) => setError(msg)} />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, !canSend && styles.btnDisabled]}
                onPress={handleSend}
                disabled={!canSend || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Request OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "verify" && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6 digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={8}
                />
                <Text style={styles.helper}>
                  Sent to {phoneInput}{" "}
                  <Text onPress={() => setStep("send")} style={styles.link}>
                    Change
                  </Text>
                </Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, !canVerify && styles.btnDisabled]}
                onPress={handleVerify}
                disabled={!canVerify || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {resendSecs > 0 ? (
                  <Text style={styles.resendDim}>Resend in {resendSecs}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} disabled={loading}>
                    <Text style={styles.link}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flexGrow: 1, padding: 20, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  sub: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, color: "#374151", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  helper: { marginTop: 6, color: "#6B7280", fontSize: 12 },
  error: { color: "#EF4444", marginTop: 8 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },
  link: { color: "#4F46E5", fontWeight: "600" },
  resendRow: { marginTop: 12, alignItems: "center" },
  resendDim: { color: "#6B7280" },
})
