import { AuthService } from "../src/auth/auth.service"

describe("AuthService OTP", () => {
  it("generates a 4-digit OTP", () => {
    const service = Object.create(AuthService.prototype) as AuthService
    // @ts-expect-error access private method for test
    const otp = service.generateOtp()
    expect(otp).toHaveLength(4)
    expect(Number.isNaN(Number(otp))).toBe(false)
  })
})
