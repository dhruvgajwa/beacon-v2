"use client"

import { useEffect, useMemo, useRef } from "react"
import { View, StyleSheet, Animated, Easing } from "react-native"

type Props = {
  active?: boolean
  size?: number // circle diameter
  color?: string
}

export default function ScanRadar({ active = false, size = 220, color = "#4F46E5" }: Props) {
  const radius = size / 2

  // Create 3 ripple animations
  const ripples = useMemo(
    () =>
      new Array(3).fill(0).map(() => ({
        scale: new Animated.Value(0.2),
        opacity: new Animated.Value(0.6),
      })),
    [],
  )

  const rotate = useRef(new Animated.Value(0)).current
  const loopsRef = useRef<Animated.CompositeAnimation[]>([])

  useEffect(() => {
    const start = () => {
      // clear previous loops
      stop()
      // Start 3 staggered ripples
      ripples.forEach((r, idx) => {
        const loop = Animated.loop(
          Animated.parallel([
            Animated.timing(r.scale, {
              toValue: 1.8,
              duration: 2200,
              delay: idx * 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(r.opacity, {
              toValue: 0,
              duration: 2200,
              delay: idx * 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        )
        loopsRef.current.push(loop)
        loop.start()
      })

      // Continuous rotation for sweep
      const rotateLoop = Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      )
      loopsRef.current.push(rotateLoop)
      rotateLoop.start()
    }

    const stop = () => {
      loopsRef.current.forEach((l) => l.stop && l.stop())
      loopsRef.current = []
      ripples.forEach((r) => {
        r.scale.setValue(0.2)
        r.opacity.setValue(0.6)
      })
      rotate.setValue(0)
    }

    if (active) start()
    else stop()

    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring to give a boundary */}
      <View
        style={[
          styles.ring,
          {
            borderColor: `${color}33`,
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      />

      {/* Expanding ripple rings */}
      {ripples.map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ripple,
            {
              borderColor: `${color}66`,
              width: size,
              height: size,
              borderRadius: radius,
              opacity: r.opacity,
              transform: [{ scale: r.scale }],
            },
          ]}
        />
      ))}

      {/* Rotating sweep (beam) */}
      <Animated.View
        style={[
          styles.beamPivot,
          {
            left: radius,
            top: radius,
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        {/* Main beam */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: -1,
            width: radius,
            height: 2,
            backgroundColor: `${color}66`,
          }}
        />
        {/* Soft glow beam (thicker and lighter) */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: -6,
            width: radius * 0.9,
            height: 12,
            backgroundColor: `${color}14`,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      </Animated.View>

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  ripple: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  beamPivot: {
    position: "absolute",
    width: 0,
    height: 0,
  },
  centerDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
})
