import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ENTALHY CNC',
  description: 'Gerador de código G para usinagem de entalhes',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
