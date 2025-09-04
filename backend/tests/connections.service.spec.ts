import { ConnectionsService } from "../src/connections/connections.service"

describe("ConnectionsService basics", () => {
  it("service compiles", () => {
    expect(typeof ConnectionsService).toBe("function")
  })

  it("has updateConnectionType method", () => {
    expect(typeof (ConnectionsService as any).prototype.updateConnectionType).toBe("function")
  })
})
