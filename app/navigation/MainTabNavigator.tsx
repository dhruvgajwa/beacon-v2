import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useThemeColors } from "../contexts/ThemeContext"

// Screens
import ReconScreen from "../screens/main/ReconScreen"
import ConnectionsScreen from "../screens/main/ConnectionsScreen"
import ProfileScreen from "../screens/main/ProfileScreen"
import PingRequestsScreen from "../screens/main/PingRequestsScreen"

// Animated icons
import RadarMiniIcon from "../components/icons/radar-mini-icon"
import BellWavesIcon from "../components/icons/bell-waves-icon"
import PeoplePulseIcon from "../components/icons/people-pulse-icon"
import UserPulseIcon from "../components/icons/user-pulse-icon"

const Tab = createBottomTabNavigator()

const MainTabNavigator = () => {
  const colors = useThemeColors()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          if (route.name === "Recon") {
            return <RadarMiniIcon size={size} />
          } else if (route.name === "Pings") {
            return <BellWavesIcon size={size} focused={focused} />
          } else if (route.name === "Connections") {
            return <PeoplePulseIcon size={size} focused={focused} />
          } else if (route.name === "Profile") {
            return <UserPulseIcon size={size} focused={focused} />
          }
          return null
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
          color: colors.text,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      })}
    >
      <Tab.Screen name="Recon" component={ReconScreen} />
      <Tab.Screen name="Pings" component={PingRequestsScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default MainTabNavigator
