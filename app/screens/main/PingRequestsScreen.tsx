"use client"

import { useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native"
import { analytics } from "../../services/analytics"
import { api } from "../../services/api"

type PingRequest = {
  id: string
  fromId: string
  toId: string
  createdAt: string
  status: "pending" | "accepted"
  fromName?: string
}

export default function PingRequestsScreen() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [items, setItems] = useState<PingRequest[]>([])
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/recon/ping-requests")
      setItems(data?.requests || data || [])
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    analytics.screenView("PingRequests")
    load()
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const accept = async (requestId: string) => {
    setActing(requestId)
    analytics.track("ping_accept_submit", { requestId })
    try {
      // using PRD alias
      await api.post("/recon/accept-recon-request", { requestId })
      analytics.track("ping_accept_success", { requestId })
      setItems((prev) => prev.filter((r) => r.id !== requestId))
      Alert.alert("Ping accepted", "They have been notified.")
    } catch (e: any) {
      analytics.track("ping_accept_error", { requestId, code: e?.response?.status })
      Alert.alert("Error", e?.response?.data?.message || "Failed to accept")
    } finally {
      setActing(null)
    }
  }

  const reject = async (requestId: string) => {
    setActing(requestId)
    analytics.track("ping_reject_submit", { requestId })
    try {
      await api.post("/recon/reject-recon-request", { requestId })
      analytics.track("ping_reject_success", { requestId })
      setItems((prev) => prev.filter((r) => r.id !== requestId))
      Alert.alert("Ping rejected", "Requester was notified.")
    } catch (e: any) {
      analytics.track("ping_reject_error", { requestId, code: e?.response?.status })
      Alert.alert("Error", e?.response?.data?.message || "Failed to reject")
    } finally {
      setActing(null)
    }
  }

  const renderItem = ({ item }: { item: PingRequest }) => {
    const isBusy = acting === item.id
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.fromName || "Someone"} pinged you</Text>
        <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.primaryBtn, isBusy && styles.disabled]}
            onPress={() => accept(item.id)}
            disabled={isBusy}
            accessibilityLabel={`accept-${item.id}`}
          >
            {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Accept</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, isBusy && styles.disabled]}
            onPress={() => reject(item.id)}
            disabled={isBusy}
            accessibilityLabel={`reject-${item.id}`}
          >
            <Text style={styles.secondaryText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container} accessibilityLabel="ping-requests-screen">
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={items.length ? undefined : styles.center}
          ListEmptyComponent={<Text style={styles.empty}>No pending requests</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: "#6B7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  title: { fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryText: { color: "#111827", fontWeight: "600" },
  disabled: { opacity: 0.5 },
})
