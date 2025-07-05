"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSimulation } from "@/context/SimulationContext"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { CollapsibleSection } from "@/components/CollapsibleSection"
import { generateGCode } from "@/lib/gcode-generator"
import { showMessage } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export default function InputPanel() {
  // State for all input parameters
  // Estado para os campos de entrada como string (permite vírgula)
  const [rawParams, setRawParams] = useState({
    pontoInicioZ: '5',
    profundidadeFinal: '-5',
    numEntalhes: '4',
    avanco: '100',
    apY: '1',
    diametroInicial: '30',
    diametroFinal: '40',
    diametroFerramenta: '8',
    aberturaChaveta: '10',
    ladoCorte: 'positivo',
    chavetaConica: false,
    anguloConico: '5',
  })

  // Estado sincronizado para uso nos cálculos (apenas números)
  const [params, setParams] = useState({
    pontoInicioZ: 5,
    profundidadeFinal: -5,
    numEntalhes: 4,
    avanco: 100,
    apY: 1,
    diametroInicial: 30,
    diametroFinal: 40,
    diametroFerramenta: 8,
    aberturaChaveta: 10,
    ladoCorte: 'positivo',
    chavetaConica: false,
    anguloConico: 5,
  })
  
  // Estado para a porcentagem de uso da ferramenta no passo lateral (0-100%)
  const [porcentagemPassoLateral, setPorcentagemPassoLateral] = useState(100)

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    raioInicial: 15,
    raioFinal: 20,
    profundidadeCalculada: 5,
    deslocamento: 1,
    numPasses: 2,
  })

  const { gCode, setGCode } = useSimulation()

  // Update calculated values when relevant parameters change
  useEffect(() => {
    updateRaiosEProfundidade()
    updateDeslocamento()
  }, [params.diametroInicial, params.diametroFinal, params.diametroFerramenta, params.aberturaChaveta, porcentagemPassoLateral])

  // Handle input changes
  // Atualiza o estado rawParams ao digitar
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target

    if (type === "radio") {
      setRawParams((prev) => ({ ...prev, ladoCorte: value }))
    } else if (type === "checkbox") {
      setRawParams((prev) => ({ ...prev, [id]: checked }))
      setParams((prev) => ({ ...prev, [id]: checked }))
    } else {
      setRawParams((prev) => ({ ...prev, [id]: value }))
    }
  }

  // Converte string para número ao sair do campo
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    if (type === "checkbox" || type === "radio") return
    let parsedValue: any = value
    if (typeof value === 'string') {
      parsedValue = value.replace(',', '.')
      if (parsedValue.trim() === "") {
        parsedValue = ''
      } else if (!isNaN(Number(parsedValue))) {
        parsedValue = Number(parsedValue)
      }
    }

    // Atualização especial para diâmetro inicial/final (ajusta lado de corte)
    if (id === "diametroInicial" || id === "diametroFinal") {
      setParams((prev) => {
        const newParams = { ...prev, [id]: parsedValue }
        const diametroInicial = id === "diametroInicial" ? parsedValue : prev.diametroInicial
        const diametroFinal = id === "diametroFinal" ? parsedValue : prev.diametroFinal
        if (diametroInicial < diametroFinal) {
          newParams.ladoCorte = "positivo"
        } else if (diametroInicial > diametroFinal) {
          newParams.ladoCorte = "negativo"
        }
        return newParams
      })
    } else {
      setParams((prev) => ({ ...prev, [id]: parsedValue }))
    }
  }

  const updateRaiosEProfundidade = () => {
    const { diametroInicial, diametroFinal } = params

    if (!isNaN(diametroInicial) && !isNaN(diametroFinal) && diametroInicial !== diametroFinal) {
      const raioInicial = diametroInicial / 2
      const raioFinal = diametroFinal / 2
      const profundidade = Math.abs(raioFinal - raioInicial)

      setCalculatedValues((prev) => ({
        ...prev,
        raioInicial,
        raioFinal,
        profundidadeCalculada: profundidade,
      }))
    } else {
      // Valores padrão seguros quando os cálculos não são válidos
      setCalculatedValues((prev) => ({
        ...prev,
        raioInicial: prev.raioInicial || 0,
        raioFinal: prev.raioFinal || 0,
        profundidadeCalculada: prev.profundidadeCalculada || 0,
      }))
    }
  }

  const updateDeslocamento = () => {
    const { diametroFerramenta, aberturaChaveta } = params

    if (!isNaN(diametroFerramenta) && !isNaN(aberturaChaveta)) {
      // Se a abertura da chaveta for maior que o diâmetro da ferramenta,
      // precisamos calcular o deslocamento necessário
      if (aberturaChaveta > diametroFerramenta) {
        const deslocamento = (aberturaChaveta - diametroFerramenta) / 2
        
        // Calcular o passo lateral com base na porcentagem selecionada
        const passoLateral = (porcentagemPassoLateral / 100) * diametroFerramenta
        
        // Calcular número de passes necessários com base no passo lateral
        const larguraTotal = aberturaChaveta - diametroFerramenta
        
        // Declarar a variável numPasses no escopo correto
        let numPasses;
        
        // Para casos onde a abertura da chaveta é até 1.625 vezes o diâmetro da ferramenta,
        // sempre usar 2 passes (um em +X e outro em -X)
        // 1.625 = 13/8 (caso específico mencionado pelo usuário)
        if (aberturaChaveta <= diametroFerramenta * 1.625) {
          numPasses = 2;
        } else {
          // Para aberturas maiores, calcular com base no passo lateral
          numPasses = Math.ceil(larguraTotal / passoLateral);
          
          // Se for número par de passes, adicionar mais um para centralizar
          if (numPasses % 2 === 0) numPasses++;
        }
        
        setCalculatedValues((prev) => ({ ...prev, deslocamento, numPasses }))
      } else {
        // Caso contrário, não é necessário deslocamento
        setCalculatedValues((prev) => ({ ...prev, deslocamento: 0, numPasses: 1 }))
      }
    }
  }

  const handleGenerateGCode = () => {
    try {
      // Validate inputs
      if (params.numEntalhes <= 0) {
        showMessage("O número de entalhes deve ser maior que zero.", "error")
        return
      }

      if (params.avanco <= 0) {
        showMessage("O avanço deve ser maior que zero.", "error")
        return
      }

      if (params.apY <= 0) {
        showMessage("O material por passe deve ser maior que zero.", "error")
        return
      }

      if (params.diametroFinal === params.diametroInicial) {
        showMessage("O diâmetro final não pode ser igual ao diâmetro inicial.", "error")
        return
      }

      if (params.diametroFerramenta <= 0) {
        showMessage("O diâmetro da ferramenta deve ser maior que zero.", "error")
        return
      }

      // Calcular o passo lateral com base na porcentagem selecionada (se aplicável)
      let passoLateral = undefined
      if (params.aberturaChaveta > params.diametroFerramenta * 1.5) {
        passoLateral = (porcentagemPassoLateral / 100) * params.diametroFerramenta
      }

      // Generate G-code com o passo lateral calculado
      const gCode = generateGCode({
        ...params,
        passoLateral
      })
      setGCode(gCode)
      showMessage("Código G gerado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao gerar código G:", error)
      showMessage(`Erro ao gerar código G: ${error}`, "error")
    }
  }

  const handleSaveGCode = () => {
    if (gCode && gCode.length > 0) {
      const codigoTexto = gCode.join("\n")
      
      // Detecta se estamos em ambiente WebView/pywebview (verifica se a API do python está disponível)
      const isWebViewEnv = !!(window as any).pywebview;
      
      if (isWebViewEnv) {
        // Usa a API Python para salvar o arquivo
        try {
          const api = (window as any).pywebview.api;
          api.save_file(codigoTexto, "codigo_entalhy_cnc.nc")
            .then((result: any) => {
              if (result.success) {
                showMessage(result.message, "success");
              } else {
                showMessage(result.message, "warning");
              }
            })
            .catch((error: any) => {
              console.error("Erro ao salvar arquivo via API:", error);
              showMessage(`Erro ao salvar arquivo: ${error}`, "error");
              
              // Fallback para método tradicional se a API falhar
              useFallbackSave(codigoTexto);
            });
        } catch (e) {
          console.error("Erro ao acessar API Python:", e);
          showMessage(`Não foi possível acessar a API de salvamento: ${e}`, "error");
          // Fallback para método tradicional
          useFallbackSave(codigoTexto);
        }
      } else {
        // Método tradicional de download via browser
        useFallbackSave(codigoTexto);
      }
    } else {
      showMessage("Nenhum código G para salvar.", "error");
    }
  }
  
  // Função auxiliar para método de salvamento via browser
  const useFallbackSave = (content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "codigo_entalhy_cnc.nc"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showMessage(`Arquivo salvo com sucesso: codigo_entalhy_cnc.nc`, "success")
  }

  // Função para formatar valores numéricos com vírgula para exibição
  const formatDisplayValue = (value: any): string => {
    if (value === "" || value === undefined || value === null) return ""
    
    // Se for um número, converter para string e substituir ponto por vírgula
    if (typeof value === 'number') {
      // Verificar se é um número inteiro
      if (Number.isInteger(value)) {
        return String(value)
      } else {
        // Para números decimais, substituir ponto por vírgula
        return String(value).replace('.', ',')
      }
    }
    
    return String(value)
  }
  
  // Manipulador para permitir digitação de vírgula e outros caracteres numéricos
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Debug: log da tecla pressionada
    console.log('Tecla pressionada:', {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which
    })
    
    // Permitir teclas de navegação e edição
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ]
    
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
      return
    }
    
    // Permitir teclas de navegação
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Permitir números (0-9)
    if (/^[0-9]$/.test(e.key)) {
      return
    }
    
    // Permitir vírgula e ponto (para decimais) - múltiplas formas de detectar
    const isCommaOrDot = (
      e.key === ',' || e.key === '.' ||
      e.code === 'Comma' || e.code === 'Period' ||
      e.code === 'NumpadDecimal' ||
      e.keyCode === 188 || e.keyCode === 190 || // vírgula e ponto no teclado principal
      e.keyCode === 110 // ponto decimal no teclado numérico
    )
    
    if (isCommaOrDot) {
      const currentValue = (e.target as HTMLInputElement).value
      // Permitir apenas uma vírgula ou ponto
      if (!currentValue.includes(',') && !currentValue.includes('.')) {
        console.log('Vírgula/ponto permitido')
        return
      } else {
        console.log('Vírgula/ponto bloqueado - já existe um separador decimal')
      }
    }
    
    // Permitir sinal de menos apenas no início
    if (e.key === '-' || e.code === 'Minus' || e.keyCode === 189) {
      const currentValue = (e.target as HTMLInputElement).value
      const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0
      if (cursorPosition === 0 && !currentValue.includes('-')) {
        return
      }
    }
    
    // Log da tecla que será bloqueada
    console.log('Tecla bloqueada:', e.key, e.code, e.keyCode)
    
    // Bloquear todas as outras teclas
    e.preventDefault()
  }
  
  const renderInputField = (id: keyof typeof rawParams, label: string, tooltip: string, props: object = {}) => {
    return (
      <div className="form-group mb-4">
        <label htmlFor={id} className="block mb-1 font-medium">
          {label}
          <Tooltip text={tooltip} />
        </label>
        <input
          type="text"
          id={id}
          value={rawParams[id] as string}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          inputMode="decimal"
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          {...props}
        />
      </div>
    )
  }

  return (
    <div className="input-panel bg-card text-card-foreground shadow-lg border p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Parâmetros de Usinagem</h2>

      <CollapsibleSection title="Usinagem" defaultOpen={true}>
        {renderInputField("pontoInicioZ", "Ponto Início Z (mm)", "Posição inicial da ferramenta no eixo Z.", { step: "0.1" })}
        {renderInputField("profundidadeFinal", "Profundidade Final Z (mm)", "Profundidade final do corte no eixo Z. Valores negativos indicam movimento para baixo.", { step: "0.1" })}
        {renderInputField("numEntalhes", "Número de Entalhes", "Quantidade de entalhes a serem usinados.", { min: "1" })}
        {renderInputField("avanco", "Avanço (mm/min)", "Velocidade de avanço da ferramenta.", { min: "1" })}
        {renderInputField("apY", "Material por Passe AP Y (mm)", "Quantidade de material removido por passe.", { step: "0.1", min: "0.1" })}
      </CollapsibleSection>

      <CollapsibleSection title="Geometria e Ferramenta" defaultOpen={true}>
        {renderInputField("diametroInicial", "Diâmetro Inicial (mm)", "Diâmetro inicial da peça.", { step: "0.1", min: "1" })}
        {renderInputField("diametroFinal", "Diâmetro Final (mm)", "Diâmetro final da peça.", { step: "0.1", min: "1" })}
        {renderInputField("diametroFerramenta", "Diâmetro da Ferramenta (mm)", "Diâmetro da ferramenta de corte.", { step: "0.1", min: "0.1" })}
        {renderInputField("aberturaChaveta", "Abertura da Chaveta X (mm)", "Largura total da chaveta.", { step: "0.1", min: "0" })}
        
        {/* Slider para porcentagem de uso da ferramenta - só aparece quando a abertura é 1.5x maior que o diâmetro */}
        {params.aberturaChaveta > params.diametroFerramenta * 1.5 && (
          <div className="form-group mb-4">
            <label className="block mb-1 font-medium flex items-center justify-between">
              <span>
                Passo Lateral ({porcentagemPassoLateral}% da ferramenta)
                <Tooltip text="Define quanto da largura da ferramenta será usado para cada passe lateral. Valores menores resultam em mais passes e melhor acabamento." />
              </span>
            </label>
            <Slider
              value={[porcentagemPassoLateral]}
              min={10}
              max={100}
              step={5}
              className="my-4"
              onValueChange={(value) => setPorcentagemPassoLateral(value[0])}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Passo efetivo: {((porcentagemPassoLateral / 100) * params.diametroFerramenta).toFixed(2)} mm
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Chaveta Cônica" defaultOpen={true}>
        <div className="form-group mb-4">
          <label htmlFor="chavetaConica" className="flex items-center mb-1 font-medium">
            <input
              type="checkbox"
              id="chavetaConica"
              checked={params.chavetaConica}
              onChange={handleInputChange}
              className="mr-2 h-4 w-4"
            />
            Ativar Chaveta Cônica
            <Tooltip text="Ativa o modo de usinagem com inclinação em graus." />
          </label>
        </div>
        {params.chavetaConica && 
          renderInputField("anguloConico", "Ângulo Cônico (graus)", "Ângulo de inclinação da chaveta em graus.", { step: "0.1", min: "0" })
        }
      </CollapsibleSection>

      <div className="bg-muted text-muted-foreground p-4 rounded-lg mt-4">
        <h3 className="font-semibold text-lg mb-2 text-card-foreground">Informações Calculadas</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Raio Inicial: {calculatedValues.raioInicial.toFixed(3)} mm</p>
          <p>Raio Final: {calculatedValues.raioFinal.toFixed(3)} mm</p>
          <p>Profundidade: {calculatedValues.profundidadeCalculada.toFixed(3)} mm</p>
          <p>Deslocamento X: {calculatedValues.deslocamento.toFixed(3)} mm</p>
          <p>Passes em X: {calculatedValues.numPasses}</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3 mt-6">
        <button onClick={handleGenerateGCode} className="w-full font-bold py-2 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Gerar Código G
        </button>
        <button onClick={handleSaveGCode} disabled={!gCode || gCode.length === 0} className="w-full font-bold py-2 px-4 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
          Salvar Código G
        </button>
      </div>

      <div id="message-container" className="mt-4"></div>
    </div>
  )
}