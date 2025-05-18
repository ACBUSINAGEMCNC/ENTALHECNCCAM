interface MachiningParams {
  pontoInicioZ: number
  profundidadeFinal: number
  numEntalhes: number
  avanco: number
  apY: number
  diametroInicial: number
  diametroFinal: number
  diametroFerramenta: number
  aberturaChaveta: number
  ladoCorte: string
  chavetaConica: boolean
  anguloConico: number
}

/**
 * Generates G-code based on machining parameters
 *
 * @param params - Object containing all machining parameters
 * @returns Array of G-code commands
 */
export function generateGCode(params: MachiningParams): string[] {
  // Calculate derived values
  const raioInicial = params.diametroInicial / 2
  const raioFinal = params.diametroFinal / 2
  const maxY = raioFinal - raioInicial
  const recuoY = raioInicial - 1 // Recuo 1mm menor que o raio inicial
  
  // Ângulo cônico em radianos (se ativado)
  const anguloRadianos = params.chavetaConica ? (params.anguloConico * Math.PI / 180) : 0

  // Calculate angle between notches
  const anguloPasso = 360 / params.numEntalhes

  // Calculate X displacement needed
  let deslocamentoX = 0
  if (params.aberturaChaveta > params.diametroFerramenta) {
    deslocamentoX = (params.aberturaChaveta - params.diametroFerramenta) / 2
  }

  // Initialize G-code array with safety moves
  const codigoG = ["G0 Z100", "G0 Y0", "G0 X0"]

  // Loop for each notch
  for (let ii = 0; ii < params.numEntalhes; ii++) {
    codigoG.push(`G0 A${(anguloPasso * ii).toFixed(2)}`) // Angular rotation
    codigoG.push(`G0 Z${params.pontoInicioZ}`) // Initial Z positioning
    codigoG.push(`G0 Y${raioInicial}`) // Initial Y positioning (initial radius)
    codigoG.push("G0 X0") // Ensure initial X position

    let yAtual = raioInicial // Start Y at initial radius

    // Loop for each pass
    while (true) {
      // If X displacement is needed, calculate passes
      if (deslocamentoX > 0) {
        // First pass on positive X side
        codigoG.push(`G0 X${deslocamentoX.toFixed(3)}`)
        
        // Apply Z movement with conical adjustment if enabled
        if (params.chavetaConica) {
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yAtual.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }
        
        // First retract to Y before raising Z
        codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)

        // Return to cutting Y position
        codigoG.push(`G0 Y${yAtual.toFixed(3)}`)

        // Second pass on negative X side
        codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
        
        // Apply Z movement with conical adjustment if enabled
        if (params.chavetaConica) {
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yAtual.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }

        // Retract to Y before raising Z
        codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)
        codigoG.push("G0 X0")
      } else {
        // Normal cut without X displacement
        if (params.chavetaConica) {
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yAtual.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }
        // Retract to Y before raising Z
        codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)
      }

      // Calculate next Y position
      const nextY = Number.parseFloat((yAtual + params.apY).toFixed(3))

      if (nextY < raioFinal) {
        // Still room for another normal advance
        codigoG.push(`G0 Y${nextY.toFixed(3)}`) // Move to next Y
        yAtual = nextY
      } else if (nextY === raioFinal) {
        // Next advance exactly reaches maximum value
        codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

        // Execute final cut
        if (deslocamentoX > 0) {
          codigoG.push(`G0 X${deslocamentoX.toFixed(3)}`)
          
          // Apply Z movement with conical adjustment if enabled
          if (params.chavetaConica) {
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          
          codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
          codigoG.push(`G0 Z${params.pontoInicioZ}`)

          codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

          codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
          
          // Apply Z movement with conical adjustment if enabled
          if (params.chavetaConica) {
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          
          codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
        } else {
          // Apply Z movement with conical adjustment if enabled
          if (params.chavetaConica) {
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
        }

        codigoG.push(`G0 Z${params.pontoInicioZ}`)
        break
      } else {
        // If next advance exceeds raioFinal and yAtual is not yet at raioFinal,
        // force the last pass exactly at raioFinal
        if (yAtual !== raioFinal) {
          codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

          if (deslocamentoX > 0) {
            codigoG.push(`G0 X${deslocamentoX.toFixed(3)}`)
            
            // Apply Z movement with conical adjustment if enabled
            if (params.chavetaConica) {
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            
            codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
            codigoG.push(`G0 Z${params.pontoInicioZ}`)

            codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

            codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
            
            // Apply Z movement with conical adjustment if enabled
            if (params.chavetaConica) {
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            
            codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
          } else {
            // Apply Z movement with conical adjustment if enabled
            if (params.chavetaConica) {
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${raioFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Ângulo: ${params.anguloConico}°)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            codigoG.push(`G0 Y${recuoY.toFixed(2)}`)
          }

          codigoG.push(`G0 Z${params.pontoInicioZ}`)
        }
        break
      }
    }
  }

  // Finalize G-code
  codigoG.push("G0 Z100") // Safety move
  codigoG.push("M30") // End of program

  return codigoG
}
