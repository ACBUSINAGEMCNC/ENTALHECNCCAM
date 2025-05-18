"use client"

import { useState, useEffect, useRef } from "react"
import { useSimulation } from "@/context/SimulationContext"
import { Canvas2D } from "@/components/visualization/Canvas2D"
import { Canvas3D } from "@/components/visualization/Canvas3D"
import { SimulationControls } from "@/components/visualization/SimulationControls"
import { processGCodeForSimulation } from "@/lib/simulation-processor"
import { showMessage } from "@/lib/utils"

/**
 * Output panel component that displays the generated G-code and visualization
 * Allows users to simulate and visualize the machining process
 */
export default function OutputPanel() {
  const [is3DMode, setIs3DMode] = useState(false)
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationPaused, setSimulationPaused] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [simulationSpeed, setSimulationSpeed] = useState(1)

  const { gCode, simulationFrames, setSimulationFrames } = useSimulation()
  const animationRef = useRef<number | null>(null)

  // Process G-code for simulation when it changes
  useEffect(() => {
    if (gCode && gCode.length > 0) {
      const frames = processGCodeForSimulation(gCode)
      setSimulationFrames(frames)
      setCurrentFrame(0)
      showMessage("Simulação pronta! Clique em Iniciar Simulação para visualizar.", "success")
    }
  }, [gCode, setSimulationFrames])

  // Handle animation frame updates
  useEffect(() => {
    if (simulationActive && !simulationPaused) {
      const animate = () => {
        setCurrentFrame((prev) => {
          // If we've reached the end, stop the simulation
          if (prev >= (simulationFrames?.length || 0) - 1) {
            setSimulationActive(false)
            return 0
          }

          // Otherwise, advance based on speed
          const increment = simulationSpeed <= 1 ? 1 : Math.ceil(simulationSpeed)
          return prev + increment
        })

        // Schedule next frame
        const frameDelay = simulationSpeed <= 1 ? 50 / simulationSpeed : 50 / Math.sqrt(simulationSpeed)
        const timeoutId = setTimeout(() => {
          if (simulationActive && !simulationPaused) {
            animationRef.current = requestAnimationFrame(animate)
          }
        }, frameDelay)

        return () => clearTimeout(timeoutId)
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [simulationActive, simulationPaused, simulationSpeed, simulationFrames])

  // Toggle simulation state
  const toggleSimulation = () => {
    if (!simulationFrames || simulationFrames.length === 0) {
      showMessage("Nenhum código gerado para simular!", "error")
      return
    }

    setSimulationActive((prev) => !prev)
    setSimulationPaused(false)
  }

  // Toggle pause state
  const togglePause = () => {
    setSimulationPaused((prev) => !prev)
  }

  // Reset simulation to beginning
  const restartSimulation = () => {
    setCurrentFrame(0)
  }

  // Save G-code to file
  const saveGCode = () => {
    if (!gCode || gCode.length === 0) {
      showMessage("Nenhum código gerado para salvar!", "error")
      return
    }

    const codigoTexto = gCode.join("\n")
    const blob = new Blob([codigoTexto], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "codigo_entalhy_cnc.nc"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showMessage("Código G salvo com sucesso!", "success")
  }

  return (
    <div className="output-panel flex-1 flex flex-col">
      <div className="code-output bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm h-72 overflow-auto font-mono mb-5">
        {gCode && gCode.length > 0 ? (
          <pre className="text-sm">{gCode.join("\n")}</pre>
        ) : (
          <em className="text-gray-500">O código G será gerado aqui...</em>
        )}
      </div>

      <div className="visualization bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm flex-grow relative">
        <h2 className="text-primary text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Visualização da Simulação
        </h2>

        <div className="view-toggle mb-3 text-right">
          <button
            className="btn btn-secondary bg-secondary text-white px-3 py-1 rounded text-sm"
            onClick={() => setIs3DMode((prev) => !prev)}
          >
            Alternar 2D/3D
          </button>
        </div>

        <div className="canvas-container relative w-full h-[350px] border border-gray-200 rounded overflow-hidden bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
          {is3DMode ? (
            <Canvas3D simulationFrames={simulationFrames || []} currentFrame={currentFrame} />
          ) : (
            <Canvas2D
              simulationFrames={simulationFrames || []}
              currentFrame={currentFrame}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
            />
          )}
        </div>

        <SimulationControls
          simulationActive={simulationActive}
          simulationPaused={simulationPaused}
          toggleSimulation={toggleSimulation}
          togglePause={togglePause}
          restartSimulation={restartSimulation}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          hasSimulationData={!!simulationFrames && simulationFrames.length > 0}
          saveGCode={saveGCode}
        />

        <div id="messageContainer" className="message info hidden mt-5 p-3 rounded text-center font-medium"></div>
      </div>
    </div>
  )
}
