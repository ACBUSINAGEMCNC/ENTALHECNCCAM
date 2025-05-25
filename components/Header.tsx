"use client"

/**
 * Header component for the ENTALHY CNC application
 * Displays the logo, title, and help button
 */
export default function Header() {
  return (
    <header className="bg-gray-800 text-white dark:bg-neutral-900 dark:text-gray-100 py-4 shadow-md">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="header-content flex items-center justify-between">
          <div className="logo flex items-center">
            {/* Usando a imagem PNG da logo Entalhy CNC */}
            <img 
              src="/images/entalhy-logo.png" 
              alt="Entalhy CNC Logo" 
              width="150" 
              height="150" 
              className="object-contain"
            />
            <h1 className="text-2xl font-semibold ml-4 sr-only">ENTALHY CNC</h1>
          </div>
          <div>
            <strong>Gerador de Código G para Usinagem de Entalhes</strong>
            <button
              id="btnHelp"
              className="btn btn-secondary ml-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded"
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
