"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"
import { api } from "./api"

export type AnalyticsEvent =
  | "screen_view"
  | "push_open"
  | "login_submit"
  | "login_otp_sent"
  | "login_error"
  | "signup_submit"
  | "signup_otp_sent"
  | "signup_error"
  | "otp_verify_submit"
  | "otp_verify_success"
  | "otp_verify_error"
  | "otp_resend_submit"
  | "otp_resend_success"
  | "otp_resend_error"
  | "recon_start"
  | "recon_complete"
  | "recon_ping"
  | "connection_request_submit"
  | "connection_request_sent"
  | "connection_request_accept"
  | "connection_request_reject"
  | "connection_type_update"
  | "ping_accept_submit"
  | "ping_accept_success"
  | "ping_accept_error"
  | "ping_reject_submit"
  | "ping_reject_success"
  | "ping_reject_error"
  | "profile_update_submit"
  | "profile_update_success"
  | "profile_update_error"
  | "photo_update_submit"
  | "photo_update_success"
  | "photo_update_error"

type EventPayload = Record<string, any>

const CLIENT_ID_KEY = "analytics_client_id"

function redact(obj: any): any {
  if (obj == null || typeof obj !== "object") return obj
  const sensitive = new Set(["otp", "password", "token", "authToken", "jwt", "phone", "phoneNumber"])
  if (Array.isArray(obj)) return obj.map(redact)
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (sensitive.has(k)) out[k] = "[REDACTED]"
    else out[k] = typeof v === "object" ? redact(v) : v
  }
  return out
}

class Analytics {
  private clientId: string | null = null
  private userId?: string | null

  private async ensureClientId() {
    if (this.clientId) return this.clientId
    let id = await AsyncStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = `cid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      await AsyncStorage.setItem(CLIENT_ID_KEY, id)
    }
    this.clientId = id
    return id
  }

  async init(userId?: string | null) {
    this.userId = userId ?? null
    await this.ensureClientId()
  }

  setUser(userId?: string | null) {
    this.userId = userId ?? null
  }

  async track(event: AnalyticsEvent, params?: EventPayload) {
    try {
      const clientId = await this.ensureClientId()
      await api.post("/analytics/track", {
        clientId,
        userId: this.userId || undefined,
        event,
        params: redact({
          ...params,
          platform: Platform.OS,
        }),
        ts: Date.now(),
      })
    } catch {
      // best-effort
    }
  }

  async screenView(screenName: string, extra?: EventPayload) {
    return this.track("screen_view", { screen_name: screenName, ...extra })
  }
}

export const analytics = new Analytics()
