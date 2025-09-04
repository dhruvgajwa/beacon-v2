"use client"

import { useEffect, useMemo, useRef } from "react"
import { Animated, Easing, View, StyleSheet } from "react-native"
import { useThemeColors } from "../../contexts/ThemeContext"

export default function RadarMiniIcon({ size = 24 }: { size?: number }) {
  const colors = useThemeColors()
  const ripples = useMemo(
    () =>
      new Array(2).fill(0).map(() => ({
        scale: new Animated.Value(0.3),
        opacity: new Animated.Value(0.7),
      })),
    [],
  )
  const rotate = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loops: Animated.CompositeAnimation[] = []
    ripples.forEach((r, idx) => {
      const l = Animated.loop(
        Animated.parallel([
          Animated.timing(r.scale, {
            toValue: 1.6,
            duration: 1600,
            delay: idx * 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(r.opacity, {
            toValue: 0,
            duration: 1600,
            delay: idx * 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      )
      loops.push(l)
      l.start()
    })

    const rotLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    rotLoop.start()
    loops.push(rotLoop)

    return () => loops.forEach((l) => (l.stop as any)?.())
  }, [ripples, rotate])

  const radius = size / 2
  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: colors.tabActive + "33",
        }}
      />
      {ripples.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 1,
            borderColor: colors.tabActive + "55",
            opacity: r.opacity,
            transform: [{ scale: r.scale }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: "absolute",
          left: radius,
          top: radius,
          transform: [{ rotate: rotation }],
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: -1,
            width: radius,
            height: 2,
            backgroundColor: colors.tabActive + "88",
          }}
        />
      </Animated.View>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.tabActive }} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
})
