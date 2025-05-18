"use client"

interface SimulationControlsProps {
  simulationActive: boolean
  simulationPaused: boolean
  toggleSimulation: () => void
  togglePause: () => void
  restartSimulation: () => void
  simulationSpeed: number
  setSimulationSpeed: (speed: number) => void
  zoomLevel: number
  setZoomLevel: (zoom: number) => void
  hasSimulationData: boolean
  saveGCode: () => void
}

/**
 * Simulation controls component
 * Provides buttons and sliders to control the simulation
 */
export function SimulationControls({
  simulationActive,
  simulationPaused,
  toggleSimulation,
  togglePause,
  restartSimulation,
  simulationSpeed,
  setSimulationSpeed,
  zoomLevel,
  setZoomLevel,
  hasSimulationData,
  saveGCode,
}: SimulationControlsProps) {
  return (
    <div className="simulation-controls mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
      <div className="simulation-buttons flex gap-3 mb-4">
        <button
          className={`btn ${simulationActive ? "btn-secondary bg-gray-600" : "btn-primary bg-primary"} text-white px-4 py-2 rounded font-medium transition-colors`}
          onClick={toggleSimulation}
          disabled={!hasSimulationData}
        >
          <span className="icon">{simulationActive ? "⏹️" : "▶️"}</span>
          {simulationActive ? "Parar Simulação" : "Iniciar Simulação"}
        </button>
        <button
          className="btn btn-secondary bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
          onClick={togglePause}
          disabled={!simulationActive || !hasSimulationData}
        >
          {simulationPaused ? "Continuar" : "Pausar"}
        </button>
        <button
          className="btn btn-secondary bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
          onClick={restartSimulation}
          disabled={!hasSimulationData}
        >
          Reiniciar
        </button>
        <button
          className="btn btn-secondary bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors ml-auto"
          onClick={saveGCode}
          disabled={!hasSimulationData}
        >
          <span className="icon">💾</span> Salvar Código
        </button>
      </div>

      <div className="speed-control flex items-center mb-3">
        <label htmlFor="simulationSpeed" className="mr-3 whitespace-nowrap font-medium">
          Velocidade:
        </label>
        <input
          type="range"
          id="simulationSpeed"
          min="0.1"
          max="5"
          step="0.1"
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(Number.parseFloat(e.target.value))}
          className="flex-grow"
        />
        <span id="speedValue" className="ml-3 font-bold text-primary min-w-[30px]">
          {simulationSpeed.toFixed(1)}x
        </span>
      </div>

      <div className="zoom-controls flex items-center">
        <button
          className="zoom-button w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-lg cursor-pointer"
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
        >
          -
        </button>
        <input
          type="range"
          id="zoomLevel"
          className="zoom-slider flex-grow mx-3"
          min="0.5"
          max="4"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(Number.parseFloat(e.target.value))}
        />
        <button
          className="zoom-button w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-lg cursor-pointer"
          onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.1))}
        >
          +
        </button>
        <span id="zoomValue" className="ml-3 font-bold min-w-[40px]">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </div>
  )
}
