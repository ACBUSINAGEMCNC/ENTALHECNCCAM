"use client"

/**
 * Help panel component that displays application usage instructions
 * Shown when the help button is clicked
 */
export default function HelpPanel() {
  return (
    <div className="help-panel hidden fixed inset-0 bg-black/70 z-50 justify-center items-center" id="helpPanel">
      <button
        className="help-close absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-white"
        onClick={() => document.getElementById("helpPanel")?.style.setProperty("display", "none")}
      >
        &times;
      </button>
      <div className="help-content bg-white dark:bg-slate-800 rounded-lg p-5 max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg dark:text-slate-200 border dark:border-slate-700">
        <h3 className="text-primary dark:text-primary-foreground text-xl font-bold mb-4">Ajuda - ENTALHY CNC</h3>

        <h4 className="font-bold mt-4 mb-2 text-foreground dark:text-slate-100">O que é o ENTALHY CNC?</h4>
        <p>
          O ENTALHY CNC é um gerador de código G especializado para usinagem de entalhes e chavetas em peças
          cilíndricas. O aplicativo permite configurar todos os parâmetros necessários e gera automaticamente o código G
          para máquinas CNC.
        </p>

        <h4 className="font-bold mt-4 mb-2 text-foreground dark:text-slate-100">Como usar:</h4>
        <ol className="list-decimal pl-5 space-y-1 text-foreground dark:text-slate-300">
          <li>
            <strong>Configure os parâmetros</strong> - Ajuste todos os valores de acordo com sua necessidade de
            usinagem.
          </li>
          <li>
            <strong>Gere o código</strong> - Clique em "Gerar Código G" para criar o programa CNC.
          </li>
          <li>
            <strong>Simule</strong> - Visualize a trajetória da ferramenta antes de enviar para a máquina.
          </li>
          <li>
            <strong>Salve o código</strong> - Exporte o código G para um arquivo .nc que pode ser carregado na sua
            máquina CNC.
          </li>
        </ol>

        <h4 className="font-bold mt-4 mb-2 text-foreground dark:text-slate-100">Parâmetros principais:</h4>
        <ul className="list-disc pl-5 space-y-1 text-foreground dark:text-slate-300">
          <li>
            <strong>Ponto Início Z</strong> - Posição inicial da ferramenta no eixo Z.
          </li>
          <li>
            <strong>Profundidade Final Z-</strong> - Profundidade máxima de corte no eixo Z.
          </li>
          <li>
            <strong>Número de Entalhes</strong> - Quantidade de entalhes distribuídos uniformemente ao redor da peça.
          </li>
          <li>
            <strong>Avanço F</strong> - Velocidade de avanço da ferramenta durante o corte.
          </li>
          <li>
            <strong>Material por Passe AP Y</strong> - Quantidade de material removido em cada passe no eixo Y.
          </li>
          <li>
            <strong>Diâmetros da Peça</strong> - Diâmetro inicial e final da peça, que determinam a profundidade do
            corte.
          </li>
          <li>
            <strong>Diâmetro da Ferramenta</strong> - Tamanho da ferramenta de corte utilizada.
          </li>
          <li>
            <strong>Abertura da Chaveta X</strong> - Largura total da chaveta em milímetros.
          </li>
          <li>
            <strong>Lado do Recuo</strong> - Define para qual lado a ferramenta recua após cada corte.
          </li>
        </ul>

        <h4 className="font-bold mt-4 mb-2 text-foreground dark:text-slate-100">Dicas:</h4>
        <ul className="list-disc pl-5 space-y-1 text-foreground dark:text-slate-300">
          <li>Use valores menores de "Material por Passe" para melhor acabamento.</li>
          <li>Ajuste a "Abertura da Chaveta X" de acordo com a ferramenta utilizada.</li>
          <li>Sempre simule o código antes de enviá-lo para a máquina CNC.</li>
          <li>Para peças de maior diâmetro, considere aumentar o número de passes.</li>
        </ul>
      </div>
    </div>
  )
}
