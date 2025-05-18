/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Habilita a exportação estática
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
  basePath: process.env.NODE_ENV === 'production' ? '/ENTALHECNCCAM' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ENTALHECNCCAM/' : '',
  trailingSlash: true, // Adiciona barra final nas URLs, útil para GitHub Pages
  // Configuração para evitar problemas com a exportação estática
  experimental: {
    appDir: false
  }
};

module.exports = nextConfig;
