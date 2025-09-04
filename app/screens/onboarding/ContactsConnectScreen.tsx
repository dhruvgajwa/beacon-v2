"use client"

import { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { getStoredContacts, type SimpleContact } from "../../services/contacts"
import { api } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

type Status = "connected" | "pending_outgoing" | "pending_incoming" | "available" | "not_registered"

const ContactsConnectScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<SimpleContact[]>([])
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({})
  const [pendingSend, setPendingSend] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const { user: currentUser } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const stored = await getStoredContacts()
        setContacts(stored)
        if (stored.length > 0) {
          const phones = stored.map((c) => c.phoneNumber)
          const [lookupRes, incomingRes] = await Promise.allSettled([
            api.post("/connections/lookup", { phoneNumbers: phones }),
            api.get("/connections/requests"),
          ])

          const sMap: Record<string, Status> = {}
          if (lookupRes.status === "fulfilled") {
            for (const r of lookupRes.value.data.results as Array<{ phoneNumber: string; status: Status }>) {
              sMap[r.phoneNumber] = r.status
            }
          }
          if (incomingRes.status === "fulfilled") {
            const incoming = incomingRes.value.data.requests || []
            for (const req of incoming) {
              const phone = req.from?.phoneNumber
              if (phone) sMap[phone] = "pending_incoming"
            }
          }
          setStatusMap(sMap)
        }
      } catch (e) {
        console.error(e)
        Alert.alert("Error", "Failed to load contacts. Please try again.")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts
    const q = query.trim().toLowerCase()
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q))
  }, [contacts, query])

  const handleConnect = async (phoneNumber: string) => {
    if (pendingSend[phoneNumber]) return
    setPendingSend((p) => ({ ...p, [phoneNumber]: true }))
    try {
      await api.post("/connections/send-request", { phoneNumber })
      setStatusMap((m) => ({ ...m, [phoneNumber]: "pending_outgoing" }))
      Alert.alert("Request sent", "Connection request has been sent.")
    } catch (e: any) {
      console.error(e)
      Alert.alert("Error", e?.response?.data?.message || "Failed to send connection request.")
    } finally {
      setPendingSend((p) => ({ ...p, [phoneNumber]: false }))
    }
  }

  const handleInvite = async (phoneNumber: string) => {
    try {
      setIsLoading(true)
      // Ask backend to create a link and send SMS + WhatsApp programmatically
      const res = await api.post("/connections/invite", { phoneNumber, sendSms: true, sendWhatsApp: true })
      const link: string = res.data.link
      const inviterName = currentUser?.name || "A friend"
      const message = `${inviterName} has requested you to use Beacon. Join here: ${link}`

      // Optional: also open WhatsApp as a fallback if provider not configured on backend
      const waUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
      const can = await Linking.canOpenURL(waUrl)
      if (can) await Linking.openURL(waUrl)

      Alert.alert("Invite sent", "We sent an SMS and WhatsApp message. You can also share via WhatsApp now.")
    } catch (e: any) {
      console.error(e)
      Alert.alert("Error", e?.response?.data?.message || "Failed to send invite")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatus = (phoneNumber: string) => {
    const st = statusMap[phoneNumber]
    switch (st) {
      case "connected":
        return (
          <View style={styles.tagConnected}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tagConnectedText}>Connected</Text>
          </View>
        )
      case "pending_outgoing":
        return (
          <View style={styles.tagPending}>
            <Ionicons name="time" size={16} color="#92400E" />
            <Text style={styles.tagPendingText}>Pending</Text>
          </View>
        )
      case "pending_incoming":
        return (
          <View style={styles.tagPendingIn}>
            <Ionicons name="mail" size={16} color="#1F2937" />
            <Text style={styles.tagPendingInText}>Requested you</Text>
          </View>
        )
      case "not_registered":
        return (
          <TouchableOpacity style={styles.inviteBtn} onPress={() => handleInvite(phoneNumber)}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.inviteBtnText}>Invite</Text>
          </TouchableOpacity>
        )
      default:
        return null
    }
  }

  const renderItem = ({ item }: { item: SimpleContact }) => {
    const st = statusMap[item.phoneNumber] || "available"
    const isActionable = st === "available"
    return (
      <View style={styles.row}>
        <View style={styles.left}>
          <View className="avatar" style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || "U"}</Text>
          </View>
          <View>
            <Text style={styles.name}>{item.name || "Unknown"}</Text>
            <Text style={styles.phone}>{item.phoneNumber}</Text>
          </View>
        </View>

        {st === "available" ? (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => handleConnect(item.phoneNumber)}
            disabled={!isActionable || !!pendingSend[item.phoneNumber]}
          >
            {pendingSend[item.phoneNumber] ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.connectBtnText}>Connect</Text>
            )}
          </TouchableOpacity>
        ) : (
          renderStatus(item.phoneNumber)
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect with your contacts</Text>
        <Text style={styles.sub}>Send requests to people you already know via phone contacts.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or number"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item, idx) => `${item.phoneNumber}-${idx}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace("Main")}>
          <Text style={styles.skipText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  sub: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#111827", padding: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  phone: { fontSize: 12, color: "#6B7280" },
  connectBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  connectBtnText: { color: "#FFFFFF", fontWeight: "600" },
  tagConnected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagConnectedText: { color: "#065F46", fontWeight: "600" },
  tagPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagPendingText: { color: "#92400E", fontWeight: "600" },
  tagPendingIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagPendingInText: { color: "#1F2937", fontWeight: "600" },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#6B7280", marginTop: 8 },
  footer: { padding: 16 },
  skipBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  skipText: { color: "#111827", fontWeight: "600" },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inviteBtnText: { color: "#FFFFFF", fontWeight: "600" },
})

export default ContactsConnectScreen
