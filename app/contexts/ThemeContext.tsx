"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Appearance, type ColorSchemeName } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { darkColors, lightColors, type ThemeColors, type ThemeMode } from "../theme/palette"

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue)

const KEY = "@Beacon:themeMode"

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("light")

  // Load from storage or OS
  useEffect(() => {
    ;(async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY)
        if (saved === "light" || saved === "dark") {
          setModeState(saved)
        } else {
          const os: ColorSchemeName = Appearance.getColorScheme()
          setModeState(os === "dark" ? "dark" : "light")
        }
      } catch {
        const os: ColorSchemeName = Appearance.getColorScheme()
        setModeState(os === "dark" ? "dark" : "light")
      }
    })()

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      ;(async () => {
        const saved = await AsyncStorage.getItem(KEY)
        if (saved) return // respect explicit user choice
        setModeState(colorScheme === "dark" ? "dark" : "light")
      })()
    })
    return () => sub.remove()
  }, [])

  const setMode = useCallback(async (m: ThemeMode) => {
    setModeState(m)
    await AsyncStorage.setItem(KEY, m)
  }, [])

  const toggle = useCallback(async () => {
    const next = mode === "light" ? "dark" : "light"
    setModeState(next)
    await AsyncStorage.setItem(KEY, next)
  }, [mode])

  const colors = useMemo<ThemeColors>(() => (mode === "dark" ? darkColors : lightColors), [mode])

  const value = useMemo(() => ({ mode, setMode, toggle, colors }), [mode, setMode, toggle, colors])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function useThemeColors() {
  return useContext(ThemeContext).colors
}
