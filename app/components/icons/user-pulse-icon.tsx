"use client"

import { useEffect, useMemo } from "react"
import { Animated, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "../../contexts/ThemeContext"

export default function UserPulseIcon({ size = 24, focused = false }: { size?: number; focused?: boolean }) {
  const colors = useThemeColors()
  const pulse = useMemo(() => new Animated.Value(1), [])

  useEffect(() => {
    if (!focused) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => (loop.stop as any)?.()
  }, [focused, pulse])

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Ionicons name="person" size={size} color={focused ? colors.tabActive : colors.tabInactive} />
    </Animated.View>
  )
}
