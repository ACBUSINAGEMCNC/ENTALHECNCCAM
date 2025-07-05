/**
 * Footer component for the ENTALHY CNC application
 * Displays copyright information
 */
export default function Footer() {
  return (
    <footer className="mt-10 text-center bg-slate-800 dark:bg-slate-900 text-white text-sm py-5 border-t border-slate-200 dark:border-slate-700">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-1">
        <div>
          &copy; {new Date().getFullYear()} ENTALHY CNC - Aplicativo Gerador de Código G
        </div>
        <div className="text-gray-300 dark:text-gray-400 text-xs">
          Desenvolvido por Cristiano Bochnia Para Artcompany A C B USINAGEM CNC LTDA.
        </div>
        <div className="text-gray-300 dark:text-gray-400 text-xs">
          Endereço: AVENIDA PIQUIRI N°: 3146 - Bairro: BRASMADEIRA - Cidade: CASCAVEL
        </div>
      </div>
    </footer>
  )
}
