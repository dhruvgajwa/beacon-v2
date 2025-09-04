import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

type TrackPayload = {
  clientId: string
  userId?: string
  event: string
  params?: Record<string, any>
}

@Injectable()
export class AnalyticsService {
  private readonly gtmUrl?: string
  private readonly ga4Mid?: string
  private readonly ga4Secret?: string
  private readonly enabled: boolean

  constructor(private readonly config: ConfigService) {
    this.enabled = this.config.get<boolean>("analytics.enabled") !== false
    this.gtmUrl = this.config.get<string>("analytics.gtmServerUrl")
    this.ga4Mid = this.config.get<string>("analytics.ga4MeasurementId")
    this.ga4Secret = this.config.get<string>("analytics.ga4ApiSecret")
  }

  private redact(params: Record<string, any> = {}) {
    const SENSITIVE = ["phone", "phoneNumber", "otp", "token", "password", "auth", "authorization"]
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(params)) {
      if (SENSITIVE.includes(k)) out[k] = "[REDACTED]"
      else out[k] = typeof v === "object" && v !== null ? this.redact(v as any) : v
    }
    return out
  }

  async track({ clientId, userId, event, params }: TrackPayload) {
    if (!this.enabled) return { ok: false, reason: "disabled" }
    const redacted = this.redact(params || {})

    // Prefer GTM Server container if configured (GA4 SSG endpoint path /g/collect)
    if (this.gtmUrl) {
      const url = `${this.gtmUrl.replace(/\/$/, "")}/g/collect?measurement_id=${encodeURIComponent(
        this.ga4Mid || "",
      )}&api_secret=${encodeURIComponent(this.ga4Secret || "")}`
      const body = {
        client_id: clientId,
        user_id: userId,
        events: [{ name: event, params: redacted }],
      }
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      return { ok: true, via: "gtm" }
    }

    // Fallback to GA4 MP
    if (this.ga4Mid && this.ga4Secret) {
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        this.ga4Mid,
      )}&api_secret=${encodeURIComponent(this.ga4Secret)}`
      const body = {
        client_id: clientId,
        user_id: userId,
        events: [{ name: event, params: redacted }],
      }
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      return { ok: true, via: "ga4" }
    }

    return { ok: false, reason: "no-destination" }
  }
}
