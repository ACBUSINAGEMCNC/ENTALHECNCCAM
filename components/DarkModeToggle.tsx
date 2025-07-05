"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/**
 * Dark mode toggle button component
 * Uses next-themes for proper theme management
 */
export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect apenas roda no cliente, então agora podemos renderizar com segurança a UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const isDark = theme === "dark"

  return (
    <button
      className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 z-50 group hover:scale-105"
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  )
}
