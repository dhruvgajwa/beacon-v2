"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { api } from "../../services/api"

export default function AcceptInviteScreen({ route, navigation }: any) {
  const tokenFromParams: string | undefined = route?.params?.token
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string>("")
  const [ok, setOk] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (!tokenFromParams) {
        setMessage("Invalid invite link.")
        setOk(false)
        setLoading(false)
        return
      }
      try {
        const res = await api.post("/connections/accept-invite", { token: tokenFromParams })
        setMessage(res.data?.message || "Connected successfully via invite.")
        setOk(true)
      } catch (e: any) {
        setMessage(e?.response?.data?.message || "Failed to accept invite.")
        setOk(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [tokenFromParams])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.sub}>Connecting…</Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: ok ? "#111827" : "#EF4444" }]}>{ok ? "Success" : "Error"}</Text>
            <Text style={styles.sub}>{message}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.replace("Main")}>
              <Text style={styles.btnText}>Go to Connections</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  sub: { color: "#6B7280", marginTop: 8, textAlign: "center" },
  btn: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
})
