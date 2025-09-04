import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Config from "react-native-config"

// Create axios instance
export const api = axios.create({
  baseURL: Config.API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@Beacon:token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Clear the token and redirect to login
      await AsyncStorage.removeItem("@Beacon:token")
      await AsyncStorage.removeItem("@Beacon:user")

      // We'll handle the redirect in the App component by checking the token
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
