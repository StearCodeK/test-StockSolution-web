// Sintaxis CommonJS
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
    analyzerMode: 'static'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    env: {
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    },

    // Configuración de Webpack para optimizaciones
    webpack: (config) => {
        // Resolver duplicación de react-dom
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-dom$': 'react-dom/profiling',
            'scheduler/tracing': 'scheduler/tracing-profiling',
            // Optimización directa para Supabase
            '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js'
        }

        // Optimización de chunks (compatible con tu versión)
        config.optimization.splitChunks = {
            chunks: 'all',
            maxSize: 244 * 1024, // 244KB
            minSize: 20 * 1024 // 20KB
        }

        return config
    },

    // Compresión automática (compatible)
    compress: true,

    // Configuración de imágenes
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
        domains: [] // Añade tus dominios aquí
    }
}

module.exports = withBundleAnalyzer(nextConfig)