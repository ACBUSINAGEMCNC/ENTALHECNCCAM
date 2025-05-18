/**
 * Updates the angle indicator display
 *
 * @param angle - Angle in degrees
 */
export function updateAngleIndicator(angle: number): void {
  const needle = document.getElementById("angleNeedle")
  const valueDisplay = document.getElementById("angleValue")
  const angleFill = document.getElementById("angleFill")

  if (needle && valueDisplay && angleFill) {
    // Update needle rotation
    needle.style.transform = `rotate(${angle}deg)`

    // Update angle value text
    valueDisplay.textContent = `${angle.toFixed(1)}°`

    // Update angle fill
    const clipPath = calculateClipPath(angle)
    angleFill.style.clipPath = clipPath
  }
}

/**
 * Calculates the clip-path for the angle fill
 *
 * @param angle - Angle in degrees
 * @returns CSS clip-path value
 */
function calculateClipPath(angle: number): string {
  // Normalize angle to 0-360
  const normalizedAngle = angle % 360
  if (normalizedAngle === 0) {
    return "polygon(50% 50%, 50% 0%, 50% 0%)"
  }

  // Calculate points to create circular sector
  const points: string[] = []
  points.push("50% 50%") // Center
  points.push("50% 0%") // Starting point (top)

  // Add intermediate points for a smooth curve
  const steps = Math.max(2, Math.floor(normalizedAngle / 10))
  for (let i = 1; i <= steps; i++) {
    const stepAngle = (((normalizedAngle * i) / steps) * Math.PI) / 180
    const x = 50 + 50 * Math.sin(stepAngle)
    const y = 50 - 50 * Math.cos(stepAngle)
    points.push(`${x}% ${y}%`)
  }

  return `polygon(${points.join(", ")})`
}

/**
 * Updates the position indicator display
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 */
export function updatePositionIndicator(x: number, y: number, z: number): void {
  const indicator = document.getElementById("positionIndicator")
  if (indicator) {
    // Update text content
    indicator.textContent = `X: ${x.toFixed(2)} | Y: ${y.toFixed(2)} | Z: ${z.toFixed(2)}`
  }
}
