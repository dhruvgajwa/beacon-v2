"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import ProfileForm from "../../components/profile/ProfileForm"
import { analytics } from "../../services/analytics"

export default function EditProfileScreen() {
  useEffect(() => {
    analytics.screenView("EditProfile")
  }, [])

  return (
    <View style={styles.container} accessibilityLabel="edit-profile-screen">
      <Text style={styles.title}>Edit Profile</Text>
      <ProfileForm />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "600", paddingHorizontal: 16, paddingTop: 16, marginBottom: 4 },
})
