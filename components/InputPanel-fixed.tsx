"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSimulation } from "@/context/SimulationContext"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { CollapsibleSection } from "@/components/CollapsibleSection"
import { generateGCode } from "@/lib/gcode-generator"
import { showMessage } from "@/lib/utils"

/**
 * Input panel component that contains all parameter input fields
 * Allows users to configure machining parameters and generate G-code
 */
export default function InputPanel() {
  // State for all input parameters
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
    ladoCorte: "positivo",
    chavetaConica: false,
    anguloConico: 5,
  })

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    raioInicial: 15,
    raioFinal: 20,
    profundidadeCalculada: 5,
    deslocamento: 1,
    numPasses: 2,
  })

  const { gCode, setGCode, setSimulationFrames } = useSimulation()

  // Update calculated values when relevant parameters change
  useEffect(() => {
    updateRaiosEProfundidade()
    updateDeslocamento()
  }, [params.diametroInicial, params.diametroFinal, params.diametroFerramenta, params.aberturaChaveta])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target

    if (type === "radio") {
      setParams((prev) => ({ ...prev, ladoCorte: value }))
    } else if (type === "checkbox") {
      setParams((prev) => ({ ...prev, [id]: checked }))
    } else {
      const parsedValue = Number.parseFloat(value)
      // Verifica se o valor é um número válido antes de atualizar o estado
      if (!isNaN(parsedValue)) {
        // Se estamos alterando um dos diâmetros, vamos atualizar o estado e depois verificar
        // se precisamos ajustar automaticamente o lado de corte
        if (id === "diametroInicial" || id === "diametroFinal") {
          setParams((prev) => {
            const newParams = { ...prev, [id]: parsedValue }
            
            // Determinar o lado de corte com base na relação entre os diâmetros
            const diametroInicial = id === "diametroInicial" ? parsedValue : prev.diametroInicial
            const diametroFinal = id === "diametroFinal" ? parsedValue : prev.diametroFinal
            
            // Se diâmetro inicial < diâmetro final: lado de recuo deve ser POSITIVO
            // Se diâmetro inicial > diâmetro final: lado de recuo deve ser NEGATIVO
            if (diametroInicial < diametroFinal) {
              newParams.ladoCorte = "positivo"
            } else if (diametroInicial > diametroFinal) {
              newParams.ladoCorte = "negativo"
            }
            
            return newParams
          })
        } else {
          // Para outros campos, apenas atualizar normalmente
          setParams((prev) => ({ ...prev, [id]: parsedValue }))
        }
      }
    }
  }

  // Calculate and update radius and depth values
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

  // Calculate and update displacement values
  const updateDeslocamento = () => {
    const { diametroFerramenta, aberturaChaveta } = params

    if (!isNaN(diametroFerramenta) && !isNaN(aberturaChaveta)) {
      // Se a abertura da chaveta for maior que o diâmetro da ferramenta,
      // precisamos calcular o deslocamento necessário
      if (aberturaChaveta > diametroFerramenta) {
        const deslocamento = (aberturaChaveta - diametroFerramenta) / 2
        const numPasses = 2 // Sempre 2 passes para X+ e X-
        setCalculatedValues((prev) => ({ ...prev, deslocamento, numPasses }))
      } else {
        // Caso contrário, não é necessário deslocamento
        setCalculatedValues((prev) => ({ ...prev, deslocamento: 0, numPasses: 1 }))
      }
    }
  }

  // Generate G-code based on current parameters
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

      if (params.aberturaChaveta < 0) {
        showMessage("A abertura da chaveta não pode ser negativa.", "error")
        return
      }

      // Generate G-code
      const gcode = generateGCode(params)
      setGCode(gcode)

      showMessage("Código G gerado com sucesso!", "success")
    } catch (error) {
      showMessage(`Erro ao gerar código G: ${error instanceof Error ? error.message : "Erro desconhecido"}`, "error")
    }
  }

  return (
    <TooltipProvider>
      <div className="input-panel bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm w-full md:w-1/2 md:max-w-md">
        <h2 className="text-primary text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Parâmetros de Usinagem
        </h2>

        <CollapsibleSection title="Usinagem" defaultOpen={true}>
          <div className="form-group mb-4">
            <label htmlFor="pontoInicioZ" className="block mb-1 font-medium">
              Ponto Início Z (mm)
              <Tooltip text="Posição inicial da ferramenta no eixo Z antes de iniciar o corte." />
            </label>
            <input
              type="number"
              id="pontoInicioZ"
              value={params.pontoInicioZ}
              onChange={handleInputChange}
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="profundidadeFinal" className="block mb-1 font-medium">
              Profundidade Final Z (mm)
              <Tooltip text="Profundidade final do corte no eixo Z. Valores negativos indicam movimento para baixo." />
            </label>
            <input
              type="number"
              id="profundidadeFinal"
              value={params.profundidadeFinal}
              onChange={handleInputChange}
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="numEntalhes" className="block mb-1 font-medium">
              Número de Entalhes
              <Tooltip text="Quantidade de entalhes a serem usinados ao redor da peça." />
            </label>
            <input
              type="number"
              id="numEntalhes"
              value={params.numEntalhes}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="avanco" className="block mb-1 font-medium">
              Avanço (mm/min)
              <Tooltip text="Velocidade de avanço da ferramenta durante o corte." />
            </label>
            <input
              type="number"
              id="avanco"
              value={params.avanco}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="apY" className="block mb-1 font-medium">
              Material por Passe AP Y (mm)
              <Tooltip text="Quantidade de material removido em cada passe no eixo Y. Valores menores resultam em mais passes e melhor acabamento." />
            </label>
            <input
              type="number"
              id="apY"
              value={params.apY}
              onChange={handleInputChange}
              step="0.1"
              min="0.1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Geometria da Peça" defaultOpen={true}>
          <div className="form-group mb-4">
            <label className="block mb-1 font-medium">
              Diâmetros da Peça
              <Tooltip text="Define o diâmetro inicial e final da peça. A diferença entre eles dividida por 2 determina a profundidade do corte no raio." />
            </label>
            <div className="diameter-fields flex gap-4">
              <div className="diameter-field flex-1">
                <label htmlFor="diametroInicial" className="block mb-1">
                  Diâmetro Inicial (mm)
                </label>
                <input
                  type="number"
                  id="diametroInicial"
                  value={params.diametroInicial}
                  onChange={handleInputChange}
                  step="0.1"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="diameter-field flex-1">
                <label htmlFor="diametroFinal" className="block mb-1">
                  Diâmetro Final (mm)
                </label>
                <input
                  type="number"
                  id="diametroFinal"
                  value={params.diametroFinal}
                  onChange={handleInputChange}
                  step="0.1"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="field-description text-sm text-gray-600 dark:text-gray-400 mt-1">
              Raio inicial: <span id="raioInicial">{(calculatedValues.raioInicial || 0).toFixed(1)}</span> mm | Raio final:{" "}
              <span id="raioFinal">{(calculatedValues.raioFinal || 0).toFixed(1)}</span> mm | Profundidade no raio:{" "}
              <span id="profundidadeCalculada">{(calculatedValues.profundidadeCalculada || 0).toFixed(1)}</span> mm
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block mb-1 font-medium">
              Lado do Recuo:
              <Tooltip text="Define a direção do recuo após o corte. Positivo recua no sentido Y+, negativo no sentido Y-." />
            </label>
            <div className="radio-group flex gap-4">
              <div className="radio-option">
                <input
                  type="radio"
                  id="ladoPositivo"
                  name="ladoCorte"
                  value="positivo"
                  checked={params.ladoCorte === "positivo"}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={params.diametroInicial > params.diametroFinal}
                />
                <label htmlFor="ladoPositivo" className={params.diametroInicial > params.diametroFinal ? "text-gray-400" : ""}>Positivo</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="ladoNegativo"
                  name="ladoCorte"
                  value="negativo"
                  checked={params.ladoCorte === "negativo"}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={params.diametroInicial < params.diametroFinal}
                />
                <label htmlFor="ladoNegativo" className={params.diametroInicial < params.diametroFinal ? "text-gray-400" : ""}>Negativo</label>
              </div>
            </div>
            <div className="field-description text-sm text-gray-600 dark:text-gray-400 mt-1">
              Determina para qual lado a ferramenta recua após cada corte
            </div>
            <div className="field-info text-sm text-amber-600 dark:text-amber-400 mt-1 border-l-2 border-amber-500 pl-2">
              {params.diametroInicial < params.diametroFinal ? 
                "Quando o diâmetro inicial é menor que o final, apenas o lado positivo é permitido." : 
                params.diametroInicial > params.diametroFinal ? 
                "Quando o diâmetro inicial é maior que o final, apenas o lado negativo é permitido." : 
                ""}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Ferramenta" defaultOpen={true}>
          <div className="form-group mb-4">
            <label htmlFor="diametroFerramenta" className="block mb-1 font-medium">
              Diâmetro da Ferramenta (mm)
              <Tooltip text="Diâmetro da ferramenta de corte. Determina o deslocamento necessário para criar a abertura da chaveta." />
            </label>
            <input
              type="number"
              id="diametroFerramenta"
              value={params.diametroFerramenta}
              onChange={handleInputChange}
              step="0.1"
              min="0.1"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="aberturaChaveta" className="block mb-1 font-medium">
              Abertura da Chaveta X (mm)
              <Tooltip text="Largura total da chaveta em milímetros. A ferramenta se deslocará automaticamente para criar esta abertura." />
            </label>
            <input
              type="number"
              id="aberturaChaveta"
              value={params.aberturaChaveta}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div
              className="field-description text-sm text-gray-600 dark:text-gray-400 mt-1"
              id="deslocamentoDescription"
            >
              Deslocamento necessário:{" "}
              {(calculatedValues.deslocamento || 0) > 0 ? `±${(calculatedValues.deslocamento || 0).toFixed(1)}mm` : "Nenhum"} (
              {calculatedValues.numPasses || 1} {(calculatedValues.numPasses || 1) === 1 ? "passe" : "passes"})
            </div>
          </div>

          <div className="form-group mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="chavetaConica"
                checked={params.chavetaConica}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="chavetaConica" className="font-medium">
                Chaveta Cônica
                <Tooltip text="Ativa o modo de chaveta cônica, onde o eixo Z trabalha em conjunto com Y para criar um cone." />
              </label>
            </div>
            
            {params.chavetaConica && (
              <div className="ml-6 mt-2">
                <label htmlFor="anguloConico" className="block mb-1">
                  Ângulo Cônico (graus):
                  <Tooltip text="Ângulo de inclinação do cone. Valores positivos inclinam para cima, negativos para baixo." />
                </label>
                <input
                  type="number"
                  id="anguloConico"
                  value={params.anguloConico}
                  onChange={handleInputChange}
                  step="0.5"
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="field-description text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Define o ângulo de inclinação da chaveta cônica
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <div className="btn-group flex gap-3 mt-5">
          <button
            id="btnGerar"
            className="btn btn-primary bg-primary text-white px-4 py-2 rounded font-medium transition-colors hover:bg-red-700"
            onClick={handleGenerateGCode}
          >
            <span className="icon">⚙️</span> Gerar Código G
          </button>
          <button
            id="btnSalvar"
            className="btn btn-secondary bg-secondary text-white px-4 py-2 rounded font-medium transition-colors hover:bg-gray-700"
            disabled={!gCode || gCode.length === 0}
            onClick={() => {
              if (gCode && gCode.length > 0) {
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
              } else {
                showMessage("Nenhum código gerado para salvar!", "error")
              }
            }}
          >
            <span className="icon">💾</span> Salvar Código
          </button>
        </div>

        <div className="machine-info bg-gray-100 dark:bg-gray-700 border-l-4 border-primary p-4 mt-5 text-sm">
          <strong>ENTALHY CNC</strong> - Máquina CNC de alta robustez para fabricação de entalhes e engrenagens.
          <br />
          <small>Suporte a chavetas internas/externas, engrenagens e geometrias especiais.</small>
        </div>
      </div>
    </TooltipProvider>
  )
}
