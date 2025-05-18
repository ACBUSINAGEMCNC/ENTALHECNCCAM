import type { SimulationFrame } from "@/types/simulation"

/**
 * Processes G-code commands to create simulation frames
 *
 * @param gCode - Array of G-code commands
 * @returns Array of simulation frames for visualization
 */
export function processGCodeForSimulation(gCode: string[]): SimulationFrame[] {
  const simulationFrames: SimulationFrame[] = []
  let currentState: SimulationFrame = { x: 0, y: 0, z: 0, a: 0, cmd: "G0" }

  // Function to extract values from G-code commands
  function parseCommand(cmd: string, state: SimulationFrame): SimulationFrame {
    const pattern = /([XYZAF])([-+]?[0-9]*\.?[0-9]+)/g
    let match
    const newState = { ...state }

    while ((match = pattern.exec(cmd)) !== null) {
      const [_, axis, value] = match
      ;(newState as any)[axis.toLowerCase()] = Number.parseFloat(value)
    }

    return newState
  }

  // Process each G-code command
  for (const cmd of gCode) {
    const cmdTrim = cmd.trim()
    if (!cmdTrim) continue

    if (cmdTrim.startsWith("G0") || cmdTrim.startsWith("G1")) {
      const commandType = cmdTrim.split(" ")[0]
      const newState = parseCommand(cmdTrim, { ...currentState, cmd: commandType })
      simulationFrames.push(newState)
      currentState = { ...newState }
    }
  }

  return simulationFrames
}
