"use client"

import { useEffect, useMemo } from "react"
import { Animated, Easing, View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "../../contexts/ThemeContext"

export default function BellWavesIcon({ size = 24, focused = false }: { size?: number; focused?: boolean }) {
  const colors = useThemeColors()
  const wave1 = useMemo(() => ({ scale: new Animated.Value(0.8), opacity: new Animated.Value(0.6) }), [])
  const wave2 = useMemo(() => ({ scale: new Animated.Value(1), opacity: new Animated.Value(0.4) }), [])

  useEffect(() => {
    if (!focused) return
    const loop = Animated.loop(
      Animated.stagger(300, [
        Animated.parallel([
          Animated.timing(wave1.scale, {
            toValue: 1.4,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(wave1.opacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(wave2.scale, {
            toValue: 1.6,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(wave2.opacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    )
    loop.start()
    return () => (loop.stop as any)?.()
  }, [focused, wave1, wave2])

  return (
    <View style={styles.wrap}>
      <Ionicons name="notifications" size={size} color={focused ? colors.tabActive : colors.tabInactive} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.wave,
          {
            borderColor: colors.tabActive + "55",
            transform: [{ scale: wave1.scale }],
            opacity: wave1.opacity,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.wave,
          {
            borderColor: colors.tabActive + "33",
            transform: [{ scale: wave2.scale }],
            opacity: wave2.opacity,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  wave: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
})
