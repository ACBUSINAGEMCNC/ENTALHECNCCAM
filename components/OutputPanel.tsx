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
  const [blockByBlockMode, setBlockByBlockMode] = useState(false)

  const { gCode, simulationFrames, setSimulationFrames } = useSimulation()
  const animationRef = useRef<number | null>(null)

  // Process G-code for simulation when it changes
  useEffect(() => {
    if (gCode && gCode.length > 0) {
      const frames = processGCodeForSimulation(gCode);
      console.log('Processed Simulation Frames:', frames);
      setSimulationFrames(frames)
      setCurrentFrame(0)
      showMessage("Simulação pronta! Clique em Iniciar Simulação para visualizar.", "success")
    }
  }, [gCode, setSimulationFrames])

  // Handle animation frame updates
  useEffect(() => {
    // Cancel any existing animation when component updates
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Only start animation if active, not paused, and not in block-by-block mode
    if (simulationActive && !simulationPaused && !blockByBlockMode) {
      let timeoutId: NodeJS.Timeout | null = null

      const animate = () => {
        setCurrentFrame((prev) => {
          // If we've reached the end, stop the simulation
          if (prev >= (simulationFrames?.length || 0) - 1) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              setSimulationActive(false)
            }, 0)
            return 0
          }

          // Otherwise, advance based on speed
          const increment = simulationSpeed <= 1 ? 1 : Math.ceil(simulationSpeed)
          return prev + increment
        })

        // Clear previous timeout
        if (timeoutId) clearTimeout(timeoutId)

        // Schedule next frame with delay based on speed
        const frameDelay = simulationSpeed <= 1 ? 100 / simulationSpeed : 100 / Math.sqrt(simulationSpeed)
        
        timeoutId = setTimeout(() => {
          // Double-check state hasn't changed before requesting next frame
          if (simulationActive && !simulationPaused && !blockByBlockMode) {
            animationRef.current = requestAnimationFrame(animate)
          }
        }, frameDelay)
      }

      // Start the animation loop
      animationRef.current = requestAnimationFrame(animate)

      // Clean up function
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      }
    }
  }, [simulationActive, simulationPaused, simulationSpeed, simulationFrames, blockByBlockMode])

  // Toggle simulation state
  const toggleSimulation = () => {
    if (!simulationFrames || simulationFrames.length === 0) {
      showMessage("Nenhum código gerado para simular!", "error")
      return
    }

    // If we're stopping the simulation, reset everything
    if (simulationActive) {
      // Stop the simulation
      setSimulationActive(false)
      setSimulationPaused(false)
      setBlockByBlockMode(false)
      
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    } else {
      // Start the simulation
      setSimulationActive(true)
      setSimulationPaused(false)
      setBlockByBlockMode(false)
    }
  }

  // Toggle pause state
  const togglePause = () => {
    if (!simulationActive) return;
    
    // When unpausing, cancel block by block mode if it was active
    if (simulationPaused) {
      setBlockByBlockMode(false)
    }
    
    // Toggle pause state
    setSimulationPaused(prev => !prev)
    
    // Cancel any ongoing animation when pausing
    if (!simulationPaused && animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Reset simulation to beginning
  const restartSimulation = () => {
    setCurrentFrame(0)
    // Keep simulation paused and in block by block mode if they were active
  }
  
  // Step one block at a time
  const stepBlock = () => {
    if (!simulationFrames || simulationFrames.length === 0) {
      showMessage("Nenhum código gerado para simular!", "error")
      return;
    }
    
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // If not already in block-by-block mode, enter it
    if (!blockByBlockMode) {
      setBlockByBlockMode(true);
      setSimulationActive(true);
      setSimulationPaused(true); // Actually paused but in block-by-block mode
    }
    
    // Move to next block/frame
    setCurrentFrame(prev => {
      const nextFrame = prev + 1;
      if (nextFrame >= (simulationFrames?.length || 0)) {
        // End reached, reset
        setTimeout(() => {
          setSimulationActive(false);
          setBlockByBlockMode(false);
        }, 0);
        return 0;
      }
      return nextFrame;
    });
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
    <div className="output-panel flex-1 flex flex-col max-w-full">
      {/* Área de código G */}
      <div className="code-output bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow-md h-72 overflow-auto font-mono mb-5 transition-colors">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-gray-800 dark:text-gray-200 text-lg font-semibold">Código G Gerado</h2>
          {gCode && gCode.length > 0 && (
            <button 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center transition-colors"
              onClick={saveGCode}
            >
              <span className="mr-1">💾</span> Salvar
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 transition-colors">
          {gCode && gCode.length > 0 ? (
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">{gCode.join("\n")}</pre>
          ) : (
            <em className="text-gray-500 dark:text-gray-400 block text-center py-4">O código G será gerado aqui...</em>
          )}
        </div>
      </div>

      {/* Área de visualização */}
      <div className="visualization bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow-md flex-grow relative transition-colors">
        <div className="flex flex-wrap justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-blue-600 dark:text-blue-400 text-xl font-semibold">
            Visualização da Simulação
          </h2>

          <div className="view-toggle">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${is3DMode 
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" 
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"}`}
              onClick={() => setIs3DMode((prev) => !prev)}
            >
              <span className="mr-1">{is3DMode ? "3D" : "2D"}</span> 
              <span className="hidden sm:inline">Visualização</span>
            </button>
          </div>
        </div>

        <div className="canvas-container relative w-full h-[250px] sm:h-[350px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shadow-inner transition-all">
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
          
          {/* Indicador de frame atual */}
          {simulationFrames && simulationFrames.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
              Frame: {currentFrame + 1}/{simulationFrames.length}
            </div>
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
          blockByBlockMode={blockByBlockMode}
          stepBlock={stepBlock}
        />

        <div id="messageContainer" className="message info hidden mt-5 p-3 rounded text-center font-medium"></div>
      </div>
    </div>
  )
}
