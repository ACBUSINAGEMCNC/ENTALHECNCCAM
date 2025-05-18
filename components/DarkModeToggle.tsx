"use client"

import { useState, useEffect } from "react"

/**
 * Dark mode toggle button component
 * Allows users to switch between light and dark mode
 */
export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Initialize state from body class
    setIsDarkMode(document.body.classList.contains("dark"))
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }

    // Save preference to localStorage
    localStorage.setItem("darkMode", newDarkMode.toString())
  }

  return (
    <button
      className="dark-mode fixed bottom-5 right-5 bg-dark text-white border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-md z-50"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="dark-mode-icon text-2xl">{isDarkMode ? "🌙" : "☀️"}</span>
    </button>
  )
}
