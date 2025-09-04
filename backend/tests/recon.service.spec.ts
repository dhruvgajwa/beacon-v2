import { ReconService } from "../src/recon/recon.service"

describe("ReconService distance", () => {
  it("computes distance ~0 for same points", () => {
    const svc = Object.create(ReconService.prototype) as any
    expect(svc.calculateDistance(10, 10, 10, 10)).toBeCloseTo(0, 3)
  })
})
