/**
 * Displays a message to the user
 *
 * @param message - Message text to display
 * @param type - Message type (info, success, error)
 */
export function showMessage(message: string, type: "info" | "success" | "error" = "info"): void {
  const container = document.getElementById("messageContainer")
  if (!container) return

  container.textContent = message
  container.className = `message ${type}`
  container.style.display = "block"

  // Hide message after a few seconds
  setTimeout(() => {
    if (container) {
      container.style.display = "none"
    }
  }, 5000)
}

/**
 * Utility function to conditionally join class names
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}
