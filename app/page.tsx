"use client"

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
