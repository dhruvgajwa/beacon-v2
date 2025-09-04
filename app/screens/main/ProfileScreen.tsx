"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Share,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"
import DeleteProfileConfirmation from "../../components/profile/DeleteProfileConfirmation"
import { useTheme, useThemeColors } from "../../contexts/ThemeContext"

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut, updateUser } = useAuth()
  const { mode, toggle } = useTheme()
  const colors = useThemeColors()
  const [isSnoozeEnabled, setIsSnoozeEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  useEffect(() => {
    if (user) {
      setIsSnoozeEnabled(user.snooze || false)
    }
  }, [user])

  const handleToggleSnooze = async () => {
    setIsUpdating(true)
    try {
      const newSnoozeValue = !isSnoozeEnabled
      await api.post("/profile/snooze", { snooze: newSnoozeValue })
      setIsSnoozeEnabled(newSnoozeValue)
      updateUser({ ...user, snooze: newSnoozeValue } as any)
    } catch {
      Alert.alert("Error", "Failed to update snooze setting. Please try again.")
      setIsSnoozeEnabled(isSnoozeEnabled)
    } finally {
      setIsUpdating(false)
    }
  }

  const exportData = async () => {
    try {
      setIsLoading(true)
      const res = await api.get("/profile/export")
      const text = JSON.stringify(res.data, null, 2)
      await Share.share({ message: text })
    } catch {
      Alert.alert("Error", "Failed to export data.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = async () => {
    Alert.alert("Clear Data", "This will remove your connections and requests. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true)
            await api.post("/profile/clear-data")
            Alert.alert("Done", "Your data has been cleared.")
          } catch {
            Alert.alert("Error", "Failed to clear data.")
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const handleEditProfile = () => navigation.navigate("EditProfile")
  const handleDeleteSuccess = () => setIsDeleteModalVisible(false)

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tabActive} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePicContainer}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePicPlaceholder, { backgroundColor: colors.tabActive }]}>
                <Text style={[styles.profilePicText, { color: colors.primaryOn }]}>{user.name?.charAt(0) || "U"}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userPhone, { color: colors.textMuted }]}>{user.phoneNumber}</Text>

          {!!user.bio && <Text style={[styles.userBio, { color: colors.textMuted }]}>{user.bio}</Text>}

          {!!user.interests?.length && (
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View key={index} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                  <Text style={{ color: colors.text }}>{interest}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: colors.tabActive }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={16} color={colors.primaryOn} />
            <Text style={[styles.editProfileButtonText, { color: colors.primaryOn }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye-off" size={22} color={colors.textMuted} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: colors.text }]}>{"Snooze Mode"}</Text>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: colors.tabInactive }}
              thumbColor={isSnoozeEnabled ? colors.tabActive : "#F9FAFB"}
              ios_backgroundColor={colors.border}
              onValueChange={handleToggleSnooze}
              value={isSnoozeEnabled}
              disabled={isUpdating}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={22} color={colors.textMuted} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: colors.tabInactive }}
              thumbColor={mode === "dark" ? colors.tabActive : "#F9FAFB"}
              ios_backgroundColor={colors.border}
              onValueChange={toggle}
              value={mode === "dark"}
            />
          </View>

          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            When snooze is enabled, you won't appear in other users' recon searches
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

          <TouchableOpacity
            style={[styles.accountItem, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => navigation.navigate("ChangeNumberRequest")}
          >
            <Ionicons name="lock-closed" size={22} color={colors.textMuted} style={styles.accountIcon} />
            <Text style={[styles.accountText, { color: colors.text }]}>Change Phone Number</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.accountItem, { backgroundColor: colors.surfaceAlt }]} onPress={exportData}>
            <Ionicons name="download" size={22} color={colors.textMuted} style={styles.accountIcon} />
            <Text style={[styles.accountText, { color: colors.text }]}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.accountItem, { backgroundColor: colors.surfaceAlt }]} onPress={clearData}>
            <Ionicons name="trash" size={22} color={colors.danger} style={styles.accountIcon} />
            <Text style={[styles.accountText, { color: colors.danger }]}>Clear My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.surface }]}
            onPress={() => signOut()}
            disabled={isLoading}
          >
            <Text style={[styles.signOutButtonText, { color: colors.text }]}>{"Sign Out"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteAccountButton, { backgroundColor: colors.surface }]}
            onPress={() => setIsDeleteModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={[styles.deleteAccountButtonText, { color: colors.danger }]}>{"Delete Account"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeleteProfileConfirmation
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onSuccess={handleDeleteSuccess}
      />

      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="large" color={colors.primaryOn} />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: { alignItems: "center", marginBottom: 32 },
  profilePicContainer: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, position: "relative" },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePicText: { fontSize: 36, fontWeight: "bold" },
  userName: { fontSize: 24, fontWeight: "bold" },
  userPhone: { fontSize: 16, marginTop: 4 },
  userBio: { fontSize: 14, textAlign: "center", marginTop: 12, paddingHorizontal: 20 },
  interestsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 12 },
  interestTag: { borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, margin: 4 },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  editProfileButtonText: { fontWeight: "600", marginLeft: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: { flexDirection: "row", alignItems: "center" },
  settingIcon: { marginRight: 12 },
  settingText: { fontSize: 16 },
  settingDescription: { fontSize: 14, marginLeft: 4, marginTop: 4, marginBottom: 16 },
  accountItem: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 16, marginBottom: 8 },
  accountIcon: { marginRight: 12 },
  accountText: { fontSize: 16, flex: 1 },
  actionButtons: { marginTop: 16, marginBottom: 32 },
  signOutButton: { borderRadius: 8, padding: 16, alignItems: "center", marginBottom: 12 },
  signOutButtonText: { fontSize: 16, fontWeight: "600" },
  deleteAccountButton: { borderRadius: 8, padding: 16, alignItems: "center" },
  deleteAccountButtonText: { fontSize: 16, fontWeight: "600" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
})

export default ProfileScreen
