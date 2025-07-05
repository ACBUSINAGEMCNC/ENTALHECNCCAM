"use client"

/**
 * Header component for the ENTALHY CNC application
 * Displays the logo, title, and help button
 */
export default function Header() {
  return (
    <header className="bg-secondary text-secondary-foreground py-4 shadow-lg border-b">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="header-content flex flex-col sm:flex-row items-center justify-between">
          <div className="logo flex items-center">
            {/* Usando a imagem PNG da logo Entalhy CNC */}
            <img 
              src="/images/entalhy-logo.png" 
              alt="Entalhy CNC Logo" 
              width="150" 
              height="150" 
              className="object-contain"
            />
            <div className="ml-4 flex flex-col">
              <h1 className="text-2xl font-semibold">ENTALHY CNC</h1>
              <div className="text-sm font-medium text-accent-foreground">A C B USINAGEM CNC LTDA.</div>
            </div>
          </div>
          <div className="mt-3 sm:mt-0 text-center sm:text-right">
            <strong>Gerador de Código G para Usinagem de Entalhes</strong>
            <button
              id="btnHelp"
              className="ml-4 px-4 py-2 rounded-md transition-colors bg-muted hover:bg-accent text-muted-foreground"
              onClick={() => document.getElementById("helpPanel")?.style.setProperty("display", "flex")}
            >
              Ajuda
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
