"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Slider from "@react-native-community/slider"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import { api } from "../../services/api"
import { startLocationSync } from "../../services/location-updater"
import ScanRadar from "../../components/scan-radar"
import { useThemeColors } from "../../contexts/ThemeContext"
import { analytics } from "../../services/analytics"

type NearbyUser = {
  id: string
  distance: number
  canSeeProfile?: boolean
  name?: string
  profilePic?: string
}

export default function ReconScreen() {
  const colors = useThemeColors()
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [distance, setDistance] = useState(25)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(30)
  const stopSyncRef = useRef<null | (() => void)>(null)
  const pollTimerRef = useRef<any>(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setLocationPermission(status === "granted")
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({})
        setLocation(loc)
        stopSyncRef.current = await startLocationSync()
      }
    })()
    return () => {
      if (stopSyncRef.current) stopSyncRef.current()
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

  useEffect(() => {
    let interval: any
    if (isScanning && timer > 0) interval = setInterval(() => setTimer((t) => t - 1), 1000)
    if (!isScanning) setTimer(30)
    return () => interval && clearInterval(interval)
  }, [isScanning, timer])

  const doFetch = useCallback(
    async (loc: Location.LocationObject) => {
      try {
        const res = await api.post("/recon", {
          location: [loc.coords.longitude, loc.coords.latitude],
          distance,
        })
        const list: NearbyUser[] = res.data?.nearbyUsers || []
        setNearbyUsers((prev) => {
          const map = new Map<string, NearbyUser>()
          ;[...prev, ...list].forEach((u) => {
            const existing = map.get(String(u.id))
            map.set(String(u.id), { ...(existing || {}), ...u })
          })
          return Array.from(map.values()).sort((a, b) => a.distance - b.distance)
        })
      } catch {
        // ignore polling errors
      }
    },
    [distance],
  )

  const startRecon = async () => {
    if (!locationPermission) {
      Alert.alert("Location Permission Required", "Beacon needs access to your location to find nearby contacts.", [
        { text: "OK" },
      ])
      return
    }
    if (!location) {
      Alert.alert("Error", "Unable to get your current location. Please try again.")
      return
    }

    void analytics.track("recon_start", { distance })

    setIsScanning(true)
    setScanComplete(false)
    setNearbyUsers([])
    setIsLoading(true)
    setTimer(30)

    await doFetch(location)

    pollTimerRef.current && clearInterval(pollTimerRef.current)
    pollTimerRef.current = setInterval(() => {
      if (!location) return
      void doFetch(location)
    }, 3000)

    setTimeout(() => {
      pollTimerRef.current && clearInterval(pollTimerRef.current)
      setIsLoading(false)
      setScanComplete(true)
      void analytics.track("recon_complete", { results: nearbyUsers.length })
      setIsScanning(false)
    }, 30000)
  }

  const sendPing = async (userId: string) => {
    void analytics.track("recon_ping", { userId })

    try {
      await api.post("/recon/ping", { userId })
      Alert.alert("Success", "Ping sent successfully! Waiting for response...")
    } catch {
      Alert.alert("Error", "Failed to send ping. Please try again.")
    }
  }

  const renderNearbyUser = ({ item }: { item: NearbyUser }) => {
    const showIdentity = item.canSeeProfile && item.name
    return (
      <View style={[styles.userCard, { backgroundColor: colors.surfaceAlt }]}>
        <View style={styles.userInfo}>
          {showIdentity ? (
            item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.tabActive }]}>
                <Text style={{ color: colors.primaryOn }}>{item.name!.charAt(0)}</Text>
              </View>
            )
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.tabInactive }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
          )}
          <View>
            <Text style={[styles.connectionName, { color: colors.text }]}>
              {showIdentity ? item.name : "Someone nearby"}
            </Text>
            <Text style={[styles.connectionPhone, { color: colors.textMuted }]}>
              {item.distance.toFixed(1)} km away
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.pingButton, { backgroundColor: colors.tabActive }]}
          onPress={() => sendPing(item.id)}
        >
          <Text style={[styles.pingButtonText, { color: colors.primaryOn }]}>Ping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <View style={styles.content}>
        <View style={styles.distanceContainer}>
          <Text
            style={[styles.distanceLabel, { color: colors.text }]}
          >{`Search Radius: ${distance.toFixed(0)} km`}</Text>
          <Slider
            style={styles.slider}
            minimumValue={15}
            maximumValue={30}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor={colors.tabActive}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.tabActive}
            disabled={isScanning}
          />
        </View>

        <View style={styles.scanContainer}>
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <View style={styles.radarWrap}>
                <ScanRadar active={isScanning} size={220} color={colors.tabActive} />
                <View style={[styles.scanButton, styles.scanButtonOverlay, { backgroundColor: colors.tabActive }]}>
                  <ActivityIndicator size="large" color={colors.primaryOn} />
                </View>
              </View>
              <Text style={[styles.scanningText, { color: colors.textMuted }]}>{`Scanning… ${timer}s`}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.scanButton, { backgroundColor: colors.tabActive }]}
              onPress={startRecon}
              disabled={isLoading}
            >
              <Ionicons name="radio" size={32} color={colors.primaryOn} />
            </TouchableOpacity>
          )}

          {!isScanning && (
            <Text style={[styles.scanButtonLabel, { color: colors.textMuted }]}>
              {scanComplete ? "Scan Again" : "Tap to Scan"}
            </Text>
          )}
        </View>

        <View style={styles.resultsContainer}>
          {scanComplete && (
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {nearbyUsers.length > 0 ? `Found ${nearbyUsers.length} nearby` : "No one nearby"}
            </Text>
          )}

          <FlatList
            data={nearbyUsers}
            renderItem={renderNearbyUser}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.usersList}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  distanceContainer: { marginBottom: 24 },
  distanceLabel: { fontSize: 16, fontWeight: "600" },
  slider: { width: "100%", height: 40 },
  scanContainer: { alignItems: "center", justifyContent: "center", marginVertical: 16 },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  scanButtonLabel: { marginTop: 12, fontSize: 16 },
  scanningContainer: { alignItems: "center" },
  scanningText: { marginTop: 12, fontSize: 16 },
  radarWrap: { alignItems: "center", justifyContent: "center", width: 240, height: 240 },
  scanButtonOverlay: { position: "absolute", width: 80, height: 80, zIndex: 10 },
  resultsContainer: { flex: 1, marginTop: 8 },
  resultsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  usersList: { paddingBottom: 20 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  connectionName: { fontSize: 16, fontWeight: "600" },
  connectionPhone: { fontSize: 14, marginTop: 2 },
  pingButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  pingButtonText: { fontWeight: "600" },
})
