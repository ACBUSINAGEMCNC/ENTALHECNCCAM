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
  passoLateral?: number // Passo lateral para múltiplos passes (opcional)
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

  // Calculate X displacement needed and number of passes
  let deslocamentoX = 0
  let numPassesLaterais = 1
  let passosX: number[] = [0] // Inicialmente apenas um passe central
  
  if (params.aberturaChaveta > params.diametroFerramenta) {
    // Determinar o passo lateral (usar diâmetro da ferramenta se não especificado)
    const passoLateral = params.passoLateral && params.passoLateral > 0 
      ? Math.min(params.passoLateral, params.diametroFerramenta) // Garantir que não seja maior que a ferramenta
      : params.diametroFerramenta
    
    // Calcular a largura efetiva para mecanizar (já descontando o diâmetro da ferramenta)
    const larguraEfetiva = params.aberturaChaveta - params.diametroFerramenta
    
    // Posição X máxima que a ferramenta deve atingir (meio caminho da largura efetiva)
    const xMaximo = larguraEfetiva / 2
    
    // Caso especial: para aberturas até 1.625x o diâmetro da ferramenta, usar apenas 2 passes laterais
    if (params.aberturaChaveta <= params.diametroFerramenta * 1.625) {
      // Dois passes simétricos, sem passe central
      numPassesLaterais = 2;
      const deslocamento = xMaximo;
      passosX = [-deslocamento, deslocamento];
    } else {
      // Para aberturas maiores, calcular múltiplos passes
      numPassesLaterais = Math.ceil(larguraEfetiva / (passoLateral * 0.9)) + 1 // +1 para garantir cobertura completa
      
      // Se for número par de passes, adicionar mais um para centralizar
      if (numPassesLaterais % 2 === 0) numPassesLaterais++
      
      // Calcular os deslocamentos X para cada passe
      passosX = []
      const metadePasses = Math.floor(numPassesLaterais / 2)
      
      // Gerar array com posições X simétricas (incluindo posição central 0)
      // MAS limitando ao xMaximo calculado
      for (let i = -metadePasses; i <= metadePasses; i++) {
        const posicaoX = (i / metadePasses) * xMaximo
        passosX.push(posicaoX)
      }
    }
    
    // Ordenar os passes para otimizar o movimento (começar do centro para fora)
    passosX.sort((a, b) => Math.abs(a) - Math.abs(b))
    
    // O deslocamento máximo será usado para cálculos de segurança
    deslocamentoX = Math.max(...passosX.map(x => Math.abs(x)))
  }

  // Calcular o ponto de recuo único para todos os cortes
  let pontoRecuoY = raioInicial; // Valor padrão
  
  if (params.chavetaConica) {
    // Calcular o deslocamento Y com base no ângulo cônico para o primeiro corte
    const profundidadeZ = Math.abs(params.profundidadeFinal);
    const deslocamentoY = profundidadeZ * Math.tan(anguloRadianos);
    const yFinalPrimeiroCorte = raioInicial + deslocamentoY;
    
    if (params.ladoCorte === "positivo") {
      // Para lado positivo, escolher o MENOR valor entre Y inicial e Y final
      pontoRecuoY = Math.min(raioInicial, yFinalPrimeiroCorte) - 1;
    } else {
      // Para lado negativo, escolher o MAIOR valor entre Y inicial e Y final
      pontoRecuoY = Math.max(raioInicial, yFinalPrimeiroCorte) + 1;
    }
  } else {
    // Para cortes não cônicos, usar a lógica padrão baseada no lado de corte
    if (params.ladoCorte === "positivo") {
      pontoRecuoY = Math.min(raioInicial, raioFinal) - 1;
    } else {
      pontoRecuoY = Math.max(raioInicial, raioFinal) + 1;
    }
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
        // Executar todos os passes laterais calculados
        for (const posicaoX of passosX) {
          // Posicionar em X para este passe
          codigoG.push(`G0 X${posicaoX.toFixed(3)}`)
          
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
          
          // Se não for o último passe, reposicionar para o próximo
          if (posicaoX !== passosX[passosX.length - 1]) {
            codigoG.push(`G0 Z${params.pontoInicioZ}`)
            codigoG.push(`G0 Y${yAtual.toFixed(3)}`)
          }
        }
        
        // Finalizar com recuo em Z e retorno a X0
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
            // Executar todos os passes laterais calculados
            for (const posicaoX of passosX) {
              // Posicionar em X para este passe
              codigoG.push(`G0 X${posicaoX.toFixed(3)}`)
              
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
              
              // Se não for o último passe, reposicionar para o próximo
              if (posicaoX !== passosX[passosX.length - 1]) {
                codigoG.push(`G0 Z${params.pontoInicioZ}`)
                codigoG.push(`G0 Y${raioFinal.toFixed(3)}`)
              }
            }
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
