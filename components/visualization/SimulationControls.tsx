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
  blockByBlockMode: boolean
  stepBlock: () => void
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
  blockByBlockMode,
  stepBlock,
}: SimulationControlsProps) {
  // Define base button classes for consistency
  const baseButtonClasses = "flex items-center justify-center text-white px-3 py-2 md:px-4 md:py-2 rounded-md font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900";

  return (
    <div className="simulation-controls mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-md transition-all">
      <div className="simulation-buttons grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-5">
        {/* Botão Iniciar/Parar */}
        <button
          className={`${baseButtonClasses} ${simulationActive 
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 col-span-2 sm:col-auto" 
            : "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 col-span-2 sm:col-auto"}
          `}
          onClick={toggleSimulation}
          disabled={!hasSimulationData}
          title={simulationActive ? "Parar simulação" : "Iniciar simulação"}
        >
          <span className="icon mr-1.5">{simulationActive ? "⏹️" : "▶️"}</span>
          <span className="hidden sm:inline">{simulationActive ? "Parar" : "Iniciar"}</span>
          <span className="sm:hidden">{simulationActive ? "Parar" : "Iniciar"}</span> {/* Visible on small screens */}
        </button>
        
        {/* Botão Pausar/Continuar */}
        <button
          className={`${baseButtonClasses} ${simulationPaused 
            ? "bg-teal-500 hover:bg-teal-600 focus:ring-teal-400" 
            : "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"}
          `}
          onClick={togglePause}
          disabled={!simulationActive || !hasSimulationData || blockByBlockMode}
          title={simulationPaused ? "Continuar simulação" : "Pausar simulação"}
        >
          <span className="icon mr-1.5">{simulationPaused ? "▶️" : "⏸️"}</span>
          <span className="hidden sm:inline">{simulationPaused ? "Continuar" : "Pausar"}</span>
          <span className="sm:hidden">{simulationPaused ? "Cont." : "Pausar"}</span>
        </button>
        
        {/* Botão Bloco a Bloco */}
        <button
          className={`${baseButtonClasses} ${blockByBlockMode 
            ? "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500" 
            : "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"}
          `}
          onClick={stepBlock}
          disabled={!hasSimulationData}
          title="Executar simulação bloco a bloco"
        >
          <span className="icon mr-1.5">⏭️</span>
          <span className="hidden sm:inline">Bloco a Bloco</span>
          <span className="sm:hidden">Blocos</span>
        </button>
        
        {/* Botão Reiniciar */}
        <button
          className={`${baseButtonClasses} bg-slate-500 hover:bg-slate-600 focus:ring-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500`}
          onClick={restartSimulation}
          disabled={!hasSimulationData}
          title="Reiniciar simulação"
        >
          <span className="icon mr-1.5">🔄</span>
          <span className="hidden sm:inline">Reiniciar</span>
          <span className="sm:hidden">Zerar</span>
        </button>
        
        {/* Botão Salvar */}
        <button
          className={`${baseButtonClasses} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 col-span-2 sm:col-auto sm:ml-auto`}
          onClick={saveGCode}
          disabled={!hasSimulationData}
          title="Salvar código G"
        >
          <span className="icon mr-1.5">💾</span>
          <span className="hidden sm:inline">Salvar Código</span>
          <span className="sm:hidden">Salvar</span>
        </button>
      </div>

      {/* Controle de Velocidade */}
      <div className="control-group mb-4">
        <label htmlFor="simulationSpeed" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Velocidade da Simulação:
        </label>
        <div className="flex items-center w-full">
          <input
            type="range"
            id="simulationSpeed"
            min="0.1"
            max="5"
            step="0.1"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number.parseFloat(e.target.value))}
            className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-sky-600 dark:accent-sky-500"
          />
          <span className="ml-3 font-semibold text-sky-600 dark:text-sky-400 min-w-[40px] text-sm text-center bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
            {simulationSpeed.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Controle de Zoom */}
      <div className="control-group">
        <label htmlFor="zoomLevel" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nível de Zoom:
        </label>
        <div className="flex items-center w-full">
          <button
            className="zoom-button w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-md text-lg font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            aria-label="Diminuir zoom"
          >
            -
          </button>
          <input
            type="range"
            id="zoomLevel"
            className="zoom-slider flex-grow mx-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-sky-600 dark:accent-sky-500"
            min="0.5"
            max="4"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number.parseFloat(e.target.value))}
          />
          <button
            className="zoom-button w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-md text-lg font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.1))}
            aria-label="Aumentar zoom"
          >
            +
          </button>
          <span className="ml-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[50px] text-sm text-center bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
