"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"
import { api } from "../../services/api"
import { analytics } from "../../services/analytics"

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async () => {
    void analytics.track("signup_submit", { nameEntered: !!name, phoneEntered: !!phoneNumber })

    if (!name) {
      setError("Please enter your name")
      return
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/signup", { name, phoneNumber })

      void analytics.track("signup_otp_sent")

      navigation.navigate("OtpVerification", {
        phoneNumber,
        userId: response.data.userId,
        mode: "signup",
      })
    } catch (error: any) {
      void analytics.track("signup_error", {
        code: error?.response?.status,
        message: error?.response?.data?.message || "unknown",
      })

      if (error.response?.status === 409) {
        // Account already exists
        setError("An account with this phone number already exists. Please login instead.")
      } else {
        setError(error.response?.data?.message || "Failed to sign up. Please try again.")
      }
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
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
              <Text style={styles.signupButtonText}>{isLoading ? "Sending OTP..." : "Sign Up"}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
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
  signupButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#6B7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "bold",
  },
})

export default SignupScreen
