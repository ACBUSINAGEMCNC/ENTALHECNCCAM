/**
 * Footer component for the ENTALHY CNC application
 * Displays copyright information
 */
export default function Footer() {
  return (
    <footer className="mt-10 text-center bg-gray-800 dark:bg-gray-900 text-white text-sm py-5 border-t border-gray-700">
      <div className="container max-w-7xl mx-auto px-4">
        &copy; {new Date().getFullYear()} ENTALHY CNC - Aplicativo Gerador de Código G
      </div>
    </footer>
  )
}
