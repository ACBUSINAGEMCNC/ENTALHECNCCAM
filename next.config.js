/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Habilita a exportação estática
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
  basePath: process.env.NODE_ENV === 'production' ? '/entalhecnccam' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/entalhecnccam/' : '',
  trailingSlash: true, // Adiciona barra final nas URLs, útil para GitHub Pages
};

module.exports = nextConfig;
