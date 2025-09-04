"use client"

import { useEffect, useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { api } from "../../services/api"
import { analytics } from "../../services/analytics"

type Profile = {
  id: string
  name: string
  phoneNumber: string
  profilePic?: string
  bio?: string
  interests?: string[]
  snooze?: boolean
}

type Props = {
  onSaved?: (p: Profile) => void
}

export default function ProfileForm({ onSaved }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/profile/me")
        setName(data?.name || "")
        setBio(data?.bio || "")
        setProfilePic(data?.profilePic || undefined)
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.message || "Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pickImage = async () => {
    analytics.track("photo_update_submit")
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== "granted") {
        Alert.alert("Permission needed", "We need access to your photos.")
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled) {
        const asset = result.assets[0]
        setPhotoUploading(true)
        // create FormData
        const body = new FormData()
        body.append("file", {
          // @ts-ignore react-native FormData file
          uri: asset.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        })
        const { data } = await api.post("/profile/update-profile-photo", body, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setProfilePic(data?.profilePic)
        analytics.track("photo_update_success")
      }
    } catch (e: any) {
      analytics.track("photo_update_error", { code: e?.response?.status })
      Alert.alert("Photo upload failed", e?.response?.data?.message || "Try again later.")
    } finally {
      setPhotoUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    analytics.track("profile_update_submit")
    try {
      const { data } = await api.patch("/profile/update-profile", { name, bio })
      analytics.track("profile_update_success")
      onSaved?.(data)
      Alert.alert("Saved", "Your profile has been updated.")
    } catch (e: any) {
      analytics.track("profile_update_error", { code: e?.response?.status })
      Alert.alert("Save failed", e?.response?.data?.message || "Try again later.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.form} accessibilityLabel="profile-form">
      <View style={styles.photoRow}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={{ color: "#9CA3AF" }}>No photo</Text>
          </View>
        )}
        <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage} disabled={photoUploading}>
          {photoUploading ? <ActivityIndicator /> : <Text style={styles.secondaryText}>Change Photo</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell something about you"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  form: { padding: 16 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  photo: { width: 64, height: 64, borderRadius: 32 },
  photoPlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  textarea: { height: 100, textAlignVertical: "top" },
  saveBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  saveText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  secondaryText: { color: "#111827", fontWeight: "600" },
})
