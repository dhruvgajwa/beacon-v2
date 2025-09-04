"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../services/api"

interface UserProfile {
  id: string
  name: string
  phoneNumber: string
  profilePic?: string
  bio?: string
  interests?: string[]
  snooze: boolean
}

interface AuthContextData {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  signIn: (token: string, userData: UserProfile) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem("@Beacon:token")
      const storedUser = await AsyncStorage.getItem("@Beacon:user")

      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }

      setIsLoading(false)
    }

    loadStorageData()
  }, [])

  async function signIn(token: string, userData: UserProfile) {
    await AsyncStorage.setItem("@Beacon:token", token)
    await AsyncStorage.setItem("@Beacon:user", JSON.stringify(userData))

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(userData)
    setIsAuthenticated(true)
  }

  async function signOut() {
    await AsyncStorage.removeItem("@Beacon:token")
    await AsyncStorage.removeItem("@Beacon:user")

    api.defaults.headers.common["Authorization"] = ""
    setUser(null)
    setIsAuthenticated(false)
  }

  function updateUser(userData: Partial<UserProfile>) {
    setUser((prevUser) => {
      if (!prevUser) return null

      const updatedUser = { ...prevUser, ...userData }
      AsyncStorage.setItem("@Beacon:user", JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
