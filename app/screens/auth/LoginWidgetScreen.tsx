"use client"

import { useMemo, useRef, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView, type WebViewMessageEvent } from "react-native-webview"
import Config from "react-native-config"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"

const widgetId = Config.MSG91_WIDGET_ID
const tokenAuth = Config.MSG91_TOKEN_AUTH

const LoginWidgetScreen = () => {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(true)
  const webRef = useRef<WebView>(null)

  const html = useMemo(() => {
    const esc = (s: string | undefined) => (s ? String(s).replace(/"/g, '\\"') : "")
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
<title>MSG91 Login</title>
<style>
  body { font-family: -apple-system, system-ui, Segoe UI, Roboto, sans-serif; padding: 16px; color: #111827; }
  .field { margin-bottom: 12px; }
  .label { font-size: 14px; margin-bottom: 6px; color: #374151; }
  .input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #D1D5DB; }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; background: #4F46E5; color: #fff; border-radius: 8px; border: none; font-weight: 600; }
  .btn.secondary { background: #F3F4F6; color: #111827; }
  .row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .muted { color: #6B7280; font-size: 12px; margin-top: 4px; }
  .hidden { display: none; }
</style>
</head>
<body>
  <h2>Login / Signup with OTP</h2>
  <div id="step-send">
    <div class="field">
      <div class="label">Name</div>
      <input id="name" class="input" placeholder="Your Name" />
    </div>
    <div class="field">
      <div class="label">Phone Number</div>
      <input id="phone" class="input" placeholder="+91XXXXXXXXXX" />
    </div>
    <div id="captchaRenderId-rn" class="field"></div>
    <div class="row">
      <button id="sendBtn" class="btn">Request OTP</button>
    </div>
    <div id="error1" class="muted"></div>
  </div>

  <div id="step-verify" class="hidden">
    <div class="field">
      <div class="label">Enter OTP</div>
      <input id="otp" class="input" placeholder="6 digit OTP" />
    </div>
    <div class="muted">Sent to <span id="phoneEcho"></span> <button id="changeBtn" class="btn secondary">Change</button></div>
    <div class="row">
      <button id="verifyBtn" class="btn">Verify OTP</button>
    </div>
    <div id="error2" class="muted"></div>
  </div>

  <script>
    // Load MSG91 OTP provider
    (function() {
      var script = document.createElement("script");
      script.src = "https://control.msg91.com/app/assets/otp-provider/otp-provider.js";
      script.async = true;
      script.onload = function() {
        var configuration = {
          widgetId: "${esc(widgetId)}",
          tokenAuth: "${esc(tokenAuth)}",
          exposeMethods: true,
          captchaRenderId: "captchaRenderId-rn",
          success: function() {},
          failure: function() {}
        };
        window.initSendOTP(configuration);
      };
      document.body.appendChild(script);
    })();

    function postMessage(data) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }

    function setError(id, msg) {
      var el = document.getElementById(id);
      if (el) el.textContent = msg || "";
    }

    var sendBtn = null, verifyBtn = null, changeBtn = null;
    var requested = false, requestId = "", currentPhone = "", currentName = "";

    function showVerify() {
      document.getElementById("step-send").classList.add("hidden");
      document.getElementById("step-verify").classList.remove("hidden");
      document.getElementById("phoneEcho").textContent = currentPhone;
      setError("error2", "");
      setTimeout(function() { document.getElementById("otp").focus(); }, 50);
    }
    function showSend() {
      document.getElementById("step-verify").classList.add("hidden");
      document.getElementById("step-send").classList.remove("hidden");
      setError("error1", "");
    }

    window.addEventListener("DOMContentLoaded", function() {
      sendBtn = document.getElementById("sendBtn");
      verifyBtn = document.getElementById("verifyBtn");
      changeBtn = document.getElementById("changeBtn");

      sendBtn.addEventListener("click", function(e) {
        e.preventDefault();
        setError("error1", "");
        var name = document.getElementById("name").value.trim();
        var phone = document.getElementById("phone").value.trim();
        if (!name) { setError("error1", "Please enter your name"); return; }
        if (!phone || !/^\\+?\\d{10,15}$/.test(phone)) {
          setError("error1", "Please enter a valid phone (E.164, e.g., +91XXXXXXXXXX)");
          return;
        }
        currentName = name;
        currentPhone = phone.replace("+", "");
        if (!window.sendOtp) {
          setError("error1", "OTP widget not ready. Please wait a moment and try again.");
          return;
        }
        window.sendOtp(currentPhone, function(data) {
          var type = data && data.type;
          if (type === "success") {
            requested = true;
            requestId = data.message; // may contain request id
            showVerify();
          } else {
            setError("error1", "Failed to send OTP. Try again.");
          }
        }, function(err) {
          setError("error1", (err && err.message) || "Failed to send OTP");
        });
      });

      changeBtn.addEventListener("click", function(e) {
        e.preventDefault();
        requested = false;
        requestId = "";
        showSend();
      });

      verifyBtn.addEventListener("click", function(e) {
        e.preventDefault();
        setError("error2", "");
        var otp = document.getElementById("otp").value.trim();
        if (!otp || !/^\\d{4,8}$/.test(otp)) {
          setError("error2", "Enter the OTP received");
          return;
        }
        if (!window.verifyOtp) {
          setError("error2", "OTP widget not ready. Please wait a moment and try again.");
          return;
        }
        window.verifyOtp(otp, function(data) {
          var token = data && data.message; // token returned by MSG91
          if (!token) {
            setError("error2", "Verification token missing");
            return;
          }
          postMessage({ type: "verified", token: token, name: currentName });
        }, function(err) {
          setError("error2", (err && err.message) || "OTP verification failed");
        }, requestId);
      });
    });
  </script>
</body>
</html>
    `.trim()
  }, [])

  const onMessage = async (e: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(e.nativeEvent.data || "{}")
      if (payload?.type === "verified" && payload?.token) {
        // Exchange MSG91 token for our app JWT
        const res = await api.post("/auth/msg91/verify", {
          token: payload.token,
          name: payload.name,
        })
        await signIn(res.data.token, res.data.user)
      }
    } catch (err: any) {
      Alert.alert("Login failed", err?.response?.data?.message || err?.message || "Unknown error")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Beacon</Text>
        <Text style={styles.sub}>Login or sign up with OTP (MSG91)</Text>
      </View>
      <View style={styles.content}>
        <WebView
          ref={webRef}
          source={{ html }}
          originWhitelist={["*"]}
          onLoadEnd={() => setLoading(false)}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          )}
        />
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  sub: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  content: { flex: 1, marginTop: 8 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
})

export default LoginWidgetScreen
