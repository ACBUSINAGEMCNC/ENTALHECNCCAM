/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const isVercel = !!process.env.VERCEL

const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Habilita a exportação estática
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
  // Ajusta paths apenas para GitHub Pages, ignora em Vercel
  basePath: isProd && !isVercel ? '/ENTALHECNCCAM' : '',
  assetPrefix: isProd && !isVercel ? '/ENTALHECNCCAM/' : '',
  trailingSlash: true, // Adiciona barra final nas URLs, útil para GitHub Pages
  typescript: {
    ignoreBuildErrors: true, // Ignora erros de TS durante o build para Vercel
  },
};

module.exports = nextConfig;
