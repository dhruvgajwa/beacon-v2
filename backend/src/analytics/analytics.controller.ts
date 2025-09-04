import { Controller, Post } from "@nestjs/common"
import type { AnalyticsService } from "./analytics.service"

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post("track")
  async track(body: {
    clientId: string
    userId?: string
    event: string
    params?: Record<string, any>
  }) {
    if (!body?.clientId || !body?.event) {
      return { ok: false, error: "clientId and event are required" }
    }
    return this.analytics.track(body)
  }
}
