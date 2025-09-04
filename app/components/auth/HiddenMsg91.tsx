"use client"

import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"
import { View, StyleSheet } from "react-native"
import { WebView, type WebViewMessageEvent } from "react-native-webview"
import Config from "react-native-config"

export type HiddenMsg91Ref = {
  ready: boolean
  sendOtp: (phoneNoWithoutPlus: string) => Promise<{ requestId?: string; raw?: any }>
  verifyOtp: (otp: string, requestId?: string) => Promise<{ token: string; raw?: any }>
}

type Props = {
  showCaptcha?: boolean
  captchaHeight?: number
  onReady?: () => void
  onError?: (err: string) => void
}

const widgetId = Config.MSG91_WIDGET_ID
const tokenAuth = Config.MSG91_TOKEN_AUTH

const HiddenMsg91 = forwardRef<HiddenMsg91Ref, Props>(function HiddenMsg91(
  { showCaptcha = true, captchaHeight = 84, onReady, onError },
  ref,
) {
  const webRef = useRef<WebView>(null)
  const [ready, setReady] = useState(false)

  const pendingResolvers = useRef<Record<string, (v: any) => void>>({})
  const pendingRejectors = useRef<Record<string, (e: any) => void>>({})

  const genId = () => Math.random().toString(36).slice(2)

  const html = useMemo(() => {
    const esc = (s?: string) => (s ? String(s).replace(/"/g, '\\"') : "")
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    #wrap { padding: 0; }
    #captchaRenderId-rn { ${showCaptcha ? "" : "display:none;"} }
  </style>
</head>
<body>
  <div id="wrap">
    <div id="captchaRenderId-rn" style="width:100%;"></div>
  </div>
  <script>
    function post(obj) {
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      } catch (e) {}
    }

    // Load MSG91 OTP provider
    (function() {
      var s = document.createElement("script");
      s.src = "https://control.msg91.com/app/assets/otp-provider/otp-provider.js";
      s.async = true;
      s.onload = function() {
        var cfg = {
          widgetId: "${esc(widgetId)}",
          tokenAuth: "${esc(tokenAuth)}",
          exposeMethods: true,
          captchaRenderId: "captchaRenderId-rn",
          success: function() {},
          failure: function() {}
        };
        try {
          window.initSendOTP(cfg);
          post({ type: "ready" });
        } catch (e) {
          post({ type: "fatal", message: "Failed to init MSG91 widget" });
        }
      };
      s.onerror = function() { post({ type: "fatal", message: "Failed to load MSG91 script" }); };
      document.body.appendChild(s);
    })();

    // Bridge calls coming from RN (identified by callId)
    window.addEventListener("message", function(evt) {
      var msg;
      try { msg = JSON.parse(evt.data); } catch(_) { return; }
      if (!msg || !msg.type) return;

      if (msg.type === "sendOtp" && window.sendOtp) {
        var callId = msg.callId;
        // MSG91 expects country code without '+'
        var mobile = String(msg.payload && msg.payload.mobile || "").replace(/^\\+/, "");
        window.sendOtp(mobile, function(data) {
          post({ type: "sendOtp:success", callId: callId, data: data });
        }, function(err) {
          post({ type: "sendOtp:error", callId: callId, error: (err && (err.message||err.error||JSON.stringify(err))) || "Unknown error" });
        });
      }

      if (msg.type === "verifyOtp" && window.verifyOtp) {
        var callId = msg.callId;
        var otp = String(msg.payload && msg.payload.otp || "");
        var requestId = msg.payload && msg.payload.requestId;
        window.verifyOtp(otp, function(data) {
          post({ type: "verifyOtp:success", callId: callId, data: data });
        }, function(err) {
          post({ type: "verifyOtp:error", callId: callId, error: (err && (err.message||err.error||JSON.stringify(err))) || "Unknown error" });
        }, requestId);
      }
    });
  </script>
</body>
</html>
    `.trim()
  }, [showCaptcha])

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(e.nativeEvent.data || "{}")
        if (data.type === "ready") {
          setReady(true)
          onReady?.()
          return
        }
        if (data.type === "fatal") {
          onError?.(data.message || "Unknown error")
          return
        }
        const callId = data.callId
        if (callId && data.type === "sendOtp:success") {
          pendingResolvers.current[callId]?.(data.data)
          delete pendingResolvers.current[callId]
          delete pendingRejectors.current[callId]
        } else if (callId && data.type === "sendOtp:error") {
          pendingRejectors.current[callId]?.(new Error(data.error || "Failed to send OTP"))
          delete pendingResolvers.current[callId]
          delete pendingRejectors.current[callId]
        } else if (callId && data.type === "verifyOtp:success") {
          pendingResolvers.current[callId]?.(data.data)
          delete pendingResolvers.current[callId]
          delete pendingRejectors.current[callId]
        } else if (callId && data.type === "verifyOtp:error") {
          pendingRejectors.current[callId]?.(new Error(data.error || "Failed to verify OTP"))
          delete pendingResolvers.current[callId]
          delete pendingRejectors.current[callId]
        }
      } catch (err) {
        onError?.((err as Error).message || "Bridge error")
      }
    },
    [onReady, onError],
  )

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    ready,
    sendOtp: (phoneNoWithoutPlus: string) =>
      new Promise((resolve, reject) => {
        const callId = genId()
        pendingResolvers.current[callId] = (raw) => {
          // MSG91 returns { type, message }. message may contain a requestId string.
          const maybeId = raw?.message
          resolve({ requestId: maybeId, raw })
        }
        pendingRejectors.current[callId] = reject
        webRef.current?.postMessage(
          JSON.stringify({ type: "sendOtp", callId, payload: { mobile: phoneNoWithoutPlus } }),
        )
      }),
    verifyOtp: (otp: string, requestId?: string) =>
      new Promise((resolve, reject) => {
        const callId = genId()
        pendingResolvers.current[callId] = (raw) => {
          const token = raw?.message // per your web modal
          if (!token) return reject(new Error("Missing token in MSG91 response"))
          resolve({ token, raw })
        }
        pendingRejectors.current[callId] = reject
        webRef.current?.postMessage(JSON.stringify({ type: "verifyOtp", callId, payload: { otp, requestId } }))
      }),
  }))

  // Height: when captcha is visible, we reserve height so user can complete it.
  const containerStyle = showCaptcha ? { height: captchaHeight } : { height: 0, opacity: 0 }

  return (
    <View style={[styles.container, containerStyle]} pointerEvents={showCaptcha ? "auto" : "none"} accessible={false}>
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        automaticallyAdjustContentInsets={false}
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        textZoom={100}
        style={styles.webview}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: { width: "100%" },
  webview: { backgroundColor: "transparent" },
})

export default HiddenMsg91
