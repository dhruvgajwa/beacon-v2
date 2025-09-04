"use client"

import * as Location from "expo-location"
import { api } from "./api"

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timeout: any
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}

const sendLocationDebounced = debounce(async (coords: Location.LocationObjectCoords) => {
  try {
    const payload = {
      location: [coords.longitude, coords.latitude],
      accuracy: coords.accuracy ?? 0,
    }
    await api.post("/profile/update-location", payload)
  } catch (e) {
    // ignore errors silently
  }
}, 3000) // 3s debounce

export async function startLocationSync(): Promise<() => void> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== "granted") {
    return () => {}
  }

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000, // request position every 5s
      distanceInterval: 25, // or every 25 meters
    },
    (loc) => {
      sendLocationDebounced(loc.coords)
    },
  )

  return () => sub.remove()
}
