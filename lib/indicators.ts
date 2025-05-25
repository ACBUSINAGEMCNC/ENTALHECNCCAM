// Store the maximum A-axis value seen so far
let maxAngle = 0;

/**
 * Updates the angle indicator display
 *
 * @param angle - Angle in degrees
 */
export function updateAngleIndicator(angle: number): void {
  const needle = document.getElementById("angleNeedle")
  const valueDisplay = document.getElementById("angleValue")
  const angleFill = document.getElementById("angleFill")
  const angleDisplayTop = document.getElementById("angleDisplayTop")

  // Track the maximum angle for fill visualization
  maxAngle = Math.max(maxAngle, Math.abs(angle))
  
  // Update the top angle display if it exists
  if (angleDisplayTop) {
    angleDisplayTop.textContent = `A: ${angle.toFixed(1)}°`
  }

  if (needle && valueDisplay && angleFill) {
    // Update needle rotation - show current position
    needle.style.transform = `rotate(${angle}deg)`

    // Update angle value text - show current value
    valueDisplay.textContent = `${angle.toFixed(1)}°`

    // For the fill, we'll show how much of 360° we've rotated
    // If we've gone beyond 360°, the fill will be complete
    const fillAngle = Math.min(Math.abs(angle), 360);
    const clipPath = calculateClipPath(fillAngle)
    angleFill.style.clipPath = clipPath
    
    // Change color intensity based on how many full rotations we've done
    const rotations = Math.floor(Math.abs(angle) / 360);
    const opacity = Math.min(0.2 + (rotations * 0.2), 0.8); // Increase opacity with rotations
    angleFill.style.backgroundColor = `rgba(204, 0, 0, ${opacity})`;
  }
}

/**
 * Calculates the clip-path for the angle fill
 *
 * @param angle - Angle in degrees
 * @returns CSS clip-path value
 */
function calculateClipPath(angle: number): string {
  // Handle special cases
  if (angle === 0) {
    return "polygon(50% 50%, 50% 0%, 50% 0%)";
  }
  
  // For a full circle (360 degrees)
  if (angle >= 360) {
    return "circle(50% at 50% 50%)";
  }

  // Calculate points to create circular sector
  const points: string[] = [];
  points.push("50% 50%"); // Center
  points.push("50% 0%"); // Starting point (top)

  // Add intermediate points for a smooth curve
  // More points for a smoother curve
  const steps = Math.max(36, Math.floor(angle / 10)); 
  for (let i = 1; i <= steps; i++) {
    const stepAngle = ((angle * i) / steps) * (Math.PI / 180);
    const x = 50 + 50 * Math.sin(stepAngle);
    const y = 50 - 50 * Math.cos(stepAngle);
    points.push(`${x}% ${y}%`);
  }

  return `polygon(${points.join(", ")})`;  
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
