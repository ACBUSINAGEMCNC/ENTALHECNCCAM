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
  
  // Determinar se estamos cortando de diâmetro maior para menor
  const cortandoAoContrario = params.diametroInicial > params.diametroFinal
  
  // Ângulo cônico em radianos (se ativado)
  const anguloRadianos = params.chavetaConica ? (params.anguloConico * Math.PI / 180) : 0

  // Calculate angle between notches
  const anguloPasso = 360 / params.numEntalhes

  // Calculate X displacement needed
  let deslocamentoX = 0
  if (params.aberturaChaveta > params.diametroFerramenta) {
    deslocamentoX = (params.aberturaChaveta - params.diametroFerramenta) / 2
  }

  // Determinar raio inicial e final para o corte
  let raioCorteInicial = raioInicial;
  let raioCorteDestino = raioFinal;
  
  // Calcular o ponto de recuo único para todos os cortes
  let pontoRecuoY = 0;
  
  // Determinar o recuo com base no lado de corte e direção do corte
  if (params.ladoCorte === "positivo") {
    // Para lado positivo, o recuo é menor que o menor valor Y
    pontoRecuoY = Math.min(raioInicial, raioFinal) - 1;
  } else {
    // Para lado negativo, o recuo é maior que o maior valor Y
    pontoRecuoY = Math.max(raioInicial, raioFinal) + 1;
  }

  // Initialize G-code array with safety moves
  const codigoG = ["G0 Z100", "G0 Y0", "G0 X0"]

  // Loop for each notch
  for (let ii = 0; ii < params.numEntalhes; ii++) {
    codigoG.push(`G0 A${(anguloPasso * ii).toFixed(2)}`) // Angular rotation
    codigoG.push(`G0 Z${params.pontoInicioZ}`) // Initial Z positioning
    
    // Posicionamento inicial no raio de início do corte
    codigoG.push(`G0 Y${raioInicial}`) // Initial Y positioning (initial radius)
    codigoG.push("G0 X0") // Ensure initial X position

    let yAtual = raioInicial // Start Y at initial radius
    let yDestino = raioFinal; // Destino final do Y
    
    // Calcular o incremento Y com base na direção do corte
    const incrementoY = cortandoAoContrario ? -Math.abs(params.apY) : Math.abs(params.apY);

    // Loop for each pass
    while (true) {
      // If X displacement is needed, calculate passes
      if (deslocamentoX > 0) {
        // First pass on positive X side
        codigoG.push(`G0 X${deslocamentoX.toFixed(3)}`)
        
        // Apply Z movement with conical adjustment if enabled
        let yFinal = yAtual;
        if (params.chavetaConica) {
          // Calcular o deslocamento Y com base no ângulo cônico
          const profundidadeZ = Math.abs(params.profundidadeFinal);
          const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
          yFinal = yAtual + deslocamentoY;
          
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }
        
        // Retract to the same Y point for all cuts
        codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)

        // Return to cutting Y position
        codigoG.push(`G0 Y${yAtual.toFixed(3)}`)

        // Second pass on negative X side
        codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
        
        // Apply Z movement with conical adjustment if enabled
        if (params.chavetaConica) {
          // Calcular o deslocamento Y com base no ângulo cônico
          const profundidadeZ = Math.abs(params.profundidadeFinal);
          const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
          yFinal = yAtual + deslocamentoY;
          
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }

        // Retract to the same Y point for all cuts
        codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)
        codigoG.push("G0 X0")
      } else {
        // Normal cut without X displacement
        let yFinal = yAtual;
        if (params.chavetaConica) {
          // Calcular o deslocamento Y com base no ângulo cônico
          const profundidadeZ = Math.abs(params.profundidadeFinal);
          const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
          yFinal = yAtual + deslocamentoY;
          
          // Movimento combinado Y e Z com ângulo cônico
          codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
        } else {
          codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
        }
        
        // Retract to the same Y point for all cuts
        codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
        codigoG.push(`G0 Z${params.pontoInicioZ}`)
      }

      // Calculate next Y position based on direction
      const nextY = Number.parseFloat((yAtual + incrementoY).toFixed(3));

      // Verificar se chegamos ao destino com base na direção do corte
      const chegouAoDestino = cortandoAoContrario 
        ? nextY <= raioFinal  // Se cortando ao contrário, verificar se chegou ou passou do raio final (que é menor)
        : nextY >= raioFinal; // Se cortando normal, verificar se chegou ou passou do raio final (que é maior)

      if (!chegouAoDestino) {
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
          let yFinal = raioFinal;
          if (params.chavetaConica) {
            // Calcular o deslocamento Y com base no ângulo cônico
            const profundidadeZ = Math.abs(params.profundidadeFinal);
            const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
            yFinal = raioFinal + deslocamentoY;
            
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          
          // Retract to the same Y point for all cuts
          codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
          codigoG.push(`G0 Z${params.pontoInicioZ}`)

          codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

          codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
          
          // Apply Z movement with conical adjustment if enabled
          if (params.chavetaConica) {
            // Calcular o deslocamento Y com base no ângulo cônico
            const profundidadeZ = Math.abs(params.profundidadeFinal);
            const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
            yFinal = raioFinal + deslocamentoY;
            
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          
          // Retract to the same Y point for all cuts
          codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
        } else {
          // Apply Z movement with conical adjustment if enabled
          let yFinal = raioFinal;
          if (params.chavetaConica) {
            // Calcular o deslocamento Y com base no ângulo cônico
            const profundidadeZ = Math.abs(params.profundidadeFinal);
            const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
            yFinal = raioFinal + deslocamentoY;
            
            // Movimento combinado Y e Z com ângulo cônico
            codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
          } else {
            codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
          }
          
          // Retract to the same Y point for all cuts
          codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
        }

        codigoG.push(`G0 Z${params.pontoInicioZ}`)
        break
      } else {
        // Se o próximo passo ultrapassa o destino, fazer o último corte exatamente no raio final
        if (yAtual !== raioFinal) {
          codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

          if (deslocamentoX > 0) {
            codigoG.push(`G0 X${deslocamentoX.toFixed(3)}`)
            
            // Apply Z movement with conical adjustment if enabled
            let yFinal = raioFinal;
            if (params.chavetaConica) {
              // Calcular o deslocamento Y com base no ângulo cônico
              const profundidadeZ = Math.abs(params.profundidadeFinal);
              const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
              yFinal = raioFinal + deslocamentoY;
              
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            
            // Retract to the same Y point for all cuts
            codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
            codigoG.push(`G0 Z${params.pontoInicioZ}`)

            codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)

            codigoG.push(`G0 X${(-deslocamentoX).toFixed(3)}`)
            
            // Apply Z movement with conical adjustment if enabled
            if (params.chavetaConica) {
              // Calcular o deslocamento Y com base no ângulo cônico
              const profundidadeZ = Math.abs(params.profundidadeFinal);
              const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
              yFinal = raioFinal + deslocamentoY;
              
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            
            // Retract to the same Y point for all cuts
            codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
          } else {
            // Apply Z movement with conical adjustment if enabled
            let yFinal = raioFinal;
            if (params.chavetaConica) {
              // Calcular o deslocamento Y com base no ângulo cônico
              const profundidadeZ = Math.abs(params.profundidadeFinal);
              const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
              yFinal = raioFinal + deslocamentoY;
              
              // Movimento combinado Y e Z com ângulo cônico
              codigoG.push(`G1 Y${yFinal.toFixed(3)} Z${params.profundidadeFinal} F${params.avanco} (Calculando para ${params.anguloConico}° graus)`)
            } else {
              codigoG.push(`G1 Z${params.profundidadeFinal} F${params.avanco}`)
            }
            
            // Retract to the same Y point for all cuts
            codigoG.push(`G0 Y${pontoRecuoY.toFixed(2)}`)
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
