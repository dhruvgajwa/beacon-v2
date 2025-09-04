import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"

@Injectable()
export class NewRelicService {
  private readonly logger = new Logger(NewRelicService.name)
  private readonly enabled: boolean
  private readonly licenseKey?: string
  private readonly endpoint: string
  private readonly appName: string

  constructor(private readonly config: ConfigService) {
    this.enabled = !!this.config.get<boolean>("newRelic.enabled")
    this.licenseKey = this.config.get<string>("newRelic.licenseKey")
    this.endpoint = this.config.get<string>("newRelic.logEndpoint") || "https://log-api.newrelic.com/log/v1"
    this.appName = this.config.get<string>("newRelic.appName") || "beacon-backend"
  }

  redact(obj: any): any {
    const SENSITIVE = ["authorization", "auth", "token", "otp", "password", "pin", "secret", "apiKey", "cookie"]
    const redactValue = (v: any) => (typeof v === "string" ? "[REDACTED]" : v)
    const walk = (input: any): any => {
      if (Array.isArray(input)) return input.map(walk)
      if (input && typeof input === "object") {
        const out: Record<string, any> = {}
        for (const [k, v] of Object.entries(input)) {
          if (SENSITIVE.includes(k.toLowerCase())) {
            out[k] = redactValue(v)
          } else {
            out[k] = walk(v)
          }
        }
        return out
      }
      return input
    }
    return walk(obj)
  }

  async log(level: LogLevel, message: string, attributes?: Record<string, any>) {
    if (!this.enabled || !this.licenseKey) {
      return
    }
    const body = [
      {
        common: {
          attributes: {
            "service.name": this.appName,
            level,
          },
        },
        logs: [
          {
            message,
            attributes: this.redact(attributes || {}),
          },
        ],
      },
    ]
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.licenseKey,
        },
        body: JSON.stringify(body),
      })
    } catch (e) {
      this.logger.error("NewRelic log send failed", e as Error)
    }
  }

  async logRequest(attributes: Record<string, any>) {
    return this.log("INFO", "http_request", attributes)
  }

  async logError(message: string, attributes?: Record<string, any>) {
    return this.log("ERROR", message, attributes)
  }
}
