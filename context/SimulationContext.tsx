"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SimulationFrame } from "@/types/simulation"

interface SimulationContextType {
  gCode: string[] | null
  setGCode: (code: string[]) => void
  simulationFrames: SimulationFrame[] | null
  setSimulationFrames: (frames: SimulationFrame[]) => void
}

/**
 * Context for sharing simulation state across components
 * Provides access to G-code and simulation frames
 */
const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [gCode, setGCode] = useState<string[] | null>(null)
  const [simulationFrames, setSimulationFrames] = useState<SimulationFrame[] | null>(null)

  return (
    <SimulationContext.Provider
      value={{
        gCode,
        setGCode,
        simulationFrames,
        setSimulationFrames,
      }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
