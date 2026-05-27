const PENDO_TRACK_URL = "https://data.pendo-dev.pendo-dev.com/data/track"
const PENDO_INTEGRATION_KEY = "c6808a32-59f0-4aa2-8529-a0a5fe5c0704"

export function pendoTrack(
  event: string,
  visitorId: string,
  accountId: string,
  properties?: Record<string, any>,
): void {
  const body = JSON.stringify({
    type: "track",
    event,
    visitorId,
    accountId,
    timestamp: Date.now(),
    properties: properties || {},
  })

  fetch(PENDO_TRACK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pendo-integration-key": PENDO_INTEGRATION_KEY,
    },
    body,
  }).catch(() => {
    // Silently ignore tracking failures to avoid breaking application flow
  })
}
