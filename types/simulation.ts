/**
 * Interface representing a single frame in the simulation
 */
export interface SimulationFrame {
  x: number // X coordinate
  y: number // Y coordinate
  z: number // Z coordinate
  a: number // A angle (rotation)
  cmd: string // Command type (G0, G1)
}
