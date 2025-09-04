export type ThemeMode = "light" | "dark"

export type ThemeColors = {
  background: string
  surface: string
  surfaceAlt: string
  text: string
  textMuted: string
  border: string
  primary: string
  primaryOn: string
  success: string
  successOn: string
  warning: string
  warningOn: string
  danger: string
  dangerOn: string
  tabActive: string
  tabInactive: string
  overlay: string
}

export const lightColors: ThemeColors = {
  // Neutral, minimal palette inspired by v0 site styling
  background: "#FFFFFF",
  surface: "#F6F7F8",
  surfaceAlt: "#F9FAFB",
  text: "#111111",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  primary: "#111111",
  primaryOn: "#FFFFFF",
  success: "#10B981",
  successOn: "#FFFFFF",
  warning: "#F59E0B",
  warningOn: "#111111",
  danger: "#EF4444",
  dangerOn: "#FFFFFF",
  tabActive: "#111111",
  tabInactive: "#9CA3AF",
  overlay: "rgba(0,0,0,0.5)",
}

export const darkColors: ThemeColors = {
  background: "#0A0A0A",
  surface: "#111111",
  surfaceAlt: "#141414",
  text: "#FAFAFA",
  textMuted: "#9CA3AF",
  border: "#262626",
  primary: "#FAFAFA",
  primaryOn: "#111111",
  success: "#22C55E",
  successOn: "#0B0B0B",
  warning: "#FBBF24",
  warningOn: "#0B0B0B",
  danger: "#F87171",
  dangerOn: "#0B0B0B",
  tabActive: "#FAFAFA",
  tabInactive: "#6B7280",
  overlay: "rgba(0,0,0,0.6)",
}
