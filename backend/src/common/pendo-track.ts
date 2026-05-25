const PENDO_TRACK_URL = "https://data.pendo.io/data/track"
const PENDO_INTEGRATION_KEY = "35345308-6b6e-4257-93e5-33ac736f5828"

export async function pendoTrack(
  event: string,
  visitorId: string,
  accountId: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(PENDO_TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pendo-integration-key": PENDO_INTEGRATION_KEY,
      },
      body: JSON.stringify({
        type: "track",
        event,
        visitorId,
        accountId,
        timestamp: Date.now(),
        properties: properties || {},
      }),
    })
  } catch (err) {
    // Log but never let tracking break application flow
    console.error(`[Pendo] Failed to track event "${event}":`, err)
  }
}
