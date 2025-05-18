"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header"
import InputPanel from "@/components/InputPanel"
import OutputPanel from "@/components/OutputPanel"
import HelpPanel from "@/components/HelpPanel"
import DarkModeToggle from "@/components/DarkModeToggle"
import Footer from "@/components/Footer"
import { SimulationProvider } from "@/context/SimulationContext"

/**
 * Main application component that renders the ENTALHY CNC G-code generator
 * This application allows users to generate G-code for machining keyways or notches
 * in cylindrical parts with customizable parameters
 */
export default function EntalyCNC() {
  // Estado para controlar se o componente está montado no cliente
  const [isMounted, setIsMounted] = useState(false)

  // Initialize dark mode from localStorage if available
  useEffect(() => {
    setIsMounted(true)
    try {
      const isDarkMode = localStorage.getItem("darkMode") === "true"
      if (isDarkMode) {
        document.body.classList.add("dark")
      }
    } catch (error) {
      console.error("Erro ao acessar localStorage:", error)
    }
  }, [])

  // Renderiza um placeholder durante a hidratação para evitar erros
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">ENTALHY CNC</h1>
          <p className="mt-2">Carregando aplicação...</p>
        </div>
      </div>
    )
  }

  return (
    <SimulationProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <div className="main-content flex flex-col md:flex-row gap-6">
              <InputPanel />
              <OutputPanel />
            </div>
          </div>
        </main>

        <HelpPanel />
        <DarkModeToggle />
        <Footer />
      </div>
    </SimulationProvider>
  )
}
