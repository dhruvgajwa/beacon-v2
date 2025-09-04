import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ProfileForm from "../../components/profile/ProfileForm"

const CreateProfileScreen = ({ navigation }: any) => {
  const handleSuccess = () => {
    navigation.navigate("Main")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>
      </View>

      <ProfileForm isNewProfile={true} onSuccess={handleSuccess} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
})

export default CreateProfileScreen
