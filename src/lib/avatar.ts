/**
 * Deterministic gradient avatar utilities.
 * Generates a consistent gradient based on a name hash using OKLch hues.
 */

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export function getAvatarGradient(name: string): string {
  const hash = hashString(name)
  const hue1 = hash % 360
  const hue2 = (hue1 + 40) % 360
  return `linear-gradient(135deg, oklch(0.65 0.18 ${hue1}), oklch(0.55 0.16 ${hue2}))`
}

export function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
