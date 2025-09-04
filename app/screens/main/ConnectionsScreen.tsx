"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { api } from "../../services/api"
import { useThemeColors } from "../../contexts/ThemeContext"
import { analytics } from "../../services/analytics"

interface Connection {
  id: string
  name: string
  phoneNumber: string
  profilePic?: string
  connectionType?: number
}

interface ConnectionRequest {
  id: string
  from: { id: string; name: string; phoneNumber: string; profilePic?: string }
  createdAt: string
}

const ConnectionsScreen = () => {
  const colors = useThemeColors()
  const [activeTab, setActiveTab] = useState("connections")
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "connections") {
        const response = await api.get("/connections")
        setConnections(response.data.connections || [])
      } else {
        const response = await api.get("/connections/requests")
        setConnectionRequests(response.data.requests || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendConnectionRequest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number")
      return
    }
    void analytics.track("connection_request_submit", { phoneEntered: !!phoneNumber })
    setIsLoading(true)
    try {
      await api.post("/connections/send-request", { phoneNumber })
      void analytics.track("connection_request_sent")
      Alert.alert("Success", "Connection request sent successfully!")
      setPhoneNumber("")
      setIsAddModalVisible(false)
    } catch (error: any) {
      console.error("Error sending connection request:", error)
      Alert.alert("Error", error.response?.data?.message || "Failed to send connection request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    void analytics.track("connection_request_accept", { requestId })
    setIsLoading(true)
    try {
      await api.post(`/connections/accept-request/${requestId}`)
      Alert.alert("Success", "Connection request accepted!")
      setConnectionRequests((prev) => prev.filter((req) => req.id !== requestId))
      fetchData()
    } catch (error) {
      console.error("Error accepting request:", error)
      Alert.alert("Error", "Failed to accept connection request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    void analytics.track("connection_request_reject", { requestId })
    setIsLoading(true)
    try {
      await api.post(`/connections/reject-request/${requestId}`)
      Alert.alert("Success", "Connection request rejected")
      setConnectionRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (error) {
      console.error("Error rejecting request:", error)
      Alert.alert("Error", "Failed to reject connection request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const setType = async (connectionId: string, value: number) => {
    void analytics.track("connection_type_update", { connectionId, value })
    try {
      setUpdating((p) => ({ ...p, [connectionId]: true }))
      await api.patch(`/connections/${connectionId}/type`, { connectionType: value })
      setConnections((prev) => prev.map((c) => (c.id === connectionId ? { ...c, connectionType: value } : c)))
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update connection type.")
    } finally {
      setUpdating((p) => ({ ...p, [connectionId]: false }))
    }
  }

  const renderConnection = ({ item }: { item: Connection }) => (
    <View style={[styles.connectionCard, { backgroundColor: colors.surfaceAlt }]}>
      <View style={styles.connectionInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.tabActive }]}>
          <Text style={[styles.avatarText, { color: colors.primaryOn }]}>{item.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={[styles.connectionName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.connectionPhone, { color: colors.textMuted }]}>{item.phoneNumber}</Text>
        </View>
      </View>

      <View style={[styles.segmentContainer, { backgroundColor: colors.surface }]}>
        {[
          { label: "Default", value: 0 },
          { label: "Close", value: 1 },
          { label: "Very Close", value: 2 },
        ].map((opt) => {
          const active = (item.connectionType ?? 0) === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.segment, active && { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setType(item.id, opt.value)}
              disabled={!!updating[item.id]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? colors.tabActive : colors.textMuted, fontWeight: active ? "700" : "500" },
                ]}
              >
                {updating[item.id] && active ? "..." : opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const renderConnectionRequest = ({ item }: { item: ConnectionRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: colors.surfaceAlt }]}>
      <View style={styles.connectionInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.tabActive }]}>
          <Text style={[styles.avatarText, { color: colors.primaryOn }]}>{item.from.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={[styles.connectionName, { color: colors.text }]}>{item.from.name}</Text>
          <Text style={[styles.connectionPhone, { color: colors.textMuted }]}>{item.from.phoneNumber}</Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tabActive }]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Text style={{ color: colors.primaryOn, fontWeight: "600" }}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={() => handleRejectRequest(item.id)}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <View style={styles.content}>
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "connections" && { backgroundColor: colors.background }]}
            onPress={() => setActiveTab("connections")}
          >
            <Text
              style={[styles.tabText, { color: activeTab === "connections" ? colors.tabActive : colors.textMuted }]}
            >
              Connections
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "requests" && { backgroundColor: colors.background }]}
            onPress={() => setActiveTab("requests")}
          >
            <Text style={[styles.tabText, { color: activeTab === "requests" ? colors.tabActive : colors.textMuted }]}>
              Requests {connectionRequests.length > 0 && `(${connectionRequests.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "connections" ? (
          <>
            <FlatList
              data={connections}
              renderItem={renderConnection}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people" size={48} color={colors.tabInactive} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>No connections yet</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                    Add connections to see them here
                  </Text>
                </View>
              }
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tabActive }]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={colors.primaryOn} />
            </TouchableOpacity>
          </>
        ) : (
          <FlatList
            data={connectionRequests}
            renderItem={renderConnectionRequest}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="mail" size={48} color={colors.tabInactive} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No pending requests</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Connection requests will appear here
                </Text>
              </View>
            }
          />
        )}

        {isAddModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Connection</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Enter phone number to send a connection request
              </Text>

              <TextInput
                style={[styles.phoneInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Phone number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.surface }]}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tabActive }]}
                  onPress={handleSendConnectionRequest}
                  disabled={isLoading}
                >
                  <Text style={{ color: colors.primaryOn, fontWeight: "600" }}>
                    {isLoading ? "Sending..." : "Send Request"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  tabContainer: { flexDirection: "row", marginBottom: 20, borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 6 },
  tabText: { fontSize: 14, fontWeight: "600" },
  list: { paddingBottom: 80 },
  connectionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "column",
    gap: 10,
  },
  connectionInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: "bold" },
  connectionName: { fontSize: 16, fontWeight: "600" },
  connectionPhone: { fontSize: 14, marginTop: 2 },
  segmentContainer: { flexDirection: "row", gap: 6, borderRadius: 8, padding: 4, alignSelf: "flex-start" },
  segment: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  requestCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  requestActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginLeft: 8 },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 16, textAlign: "center" },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: "center" },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  phoneInput: { borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  modalButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginLeft: 8 },
})

export default ConnectionsScreen
