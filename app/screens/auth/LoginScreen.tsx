"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"
import { api } from "../../services/api"
import { analytics } from "../../services/analytics"

const LoginScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    setError("")
    void analytics.track("login_submit", { phoneEntered: !!phoneNumber })

    try {
      const response = await api.post("/auth/login", { phoneNumber })
      void analytics.track("login_otp_sent")

      navigation.navigate("OtpVerification", {
        phoneNumber,
        userId: response.data.userId,
        mode: "login",
      })
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to login. Please try again.")
      void analytics.track("login_error", { message: error?.response?.data?.message || "unknown" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Beacon</Text>
            <Text style={styles.tagline}>Connect with people nearby</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoCapitalize="none"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              <Text style={styles.loginButtonText}>{isLoading ? "Sending OTP..." : "Login"}</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signupLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default LoginScreen
