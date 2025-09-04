import type { ConfigService } from "@nestjs/config"
import { NewRelicService } from "../src/monitoring/newrelic.service"

describe("NewRelicService", () => {
  it("redacts sensitive fields", () => {
    const cfg = {
      get: (k: string) => {
        if (k === "newRelic.enabled") return false
        return undefined
      },
    } as unknown as ConfigService
    const svc = new NewRelicService(cfg)
    const out = svc.redact({
      authorization: "Bearer abc",
      otp: "1234",
      nested: { token: "secret", keep: "ok" },
    })
    expect(out.authorization).toBe("[REDACTED]")
    expect(out.otp).toBe("[REDACTED]")
    expect(out.nested.token).toBe("[REDACTED]")
    expect(out.nested.keep).toBe("ok")
  })
})
