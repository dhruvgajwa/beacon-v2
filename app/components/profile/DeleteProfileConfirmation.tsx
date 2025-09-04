"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { api } from "../../services/api"

interface DeleteProfileConfirmationProps {
  isVisible: boolean
  onClose: () => void
  onSuccess: () => void
}

const DeleteProfileConfirmation: React.FC<DeleteProfileConfirmationProps> = ({ isVisible, onClose, onSuccess }) => {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDeleteProfile = async () => {
    setIsLoading(true)
    setError("")

    try {
      await api.delete("/profile")
      await signOut()
      onSuccess()
    } catch (error: any) {
      console.error("Error deleting profile:", error)
      setError(error.response?.data?.message || "Failed to delete profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={40} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Delete Profile</Text>

          <Text style={styles.message}>
            Are you sure you want to delete your profile? This action cannot be undone. All your data, connections, and
            messages will be permanently deleted.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DeleteProfileConfirmation
