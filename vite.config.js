import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Gzip + Brotli — Cloudways Nginx يخدم الملف المضغوط مباشرة إن وُجد
    compression({ algorithm: 'gzip',          ext: '.gz', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
  ],

  base: '/',

  build: {
    outDir:   'dist',
    assetsDir: 'assets',
    sourcemap: false,                    // لا source maps في الإنتاج
    target:    'es2020',                 // حذف polyfills غير ضرورية (Chrome 87+ = 98% KSA)
    reportCompressedSize: false,         // يسرّع البناء — الحجم يظهر من .gz
    chunkSizeWarningLimit: 600,          // kB — تحذير عند تجاوز الحجم

    rollupOptions: {
      output: {
        // ── تقسيم الـ Chunks لتحسين Cache على CDN ──
        manualChunks: {
          // React core — نادراً يتغير، يبقى مكبوتاً في cache المتصفح
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // الأيقونات — حزمة كبيرة تُحمَّل بشكل منفصل
          icons:  ['lucide-react'],
        },
        // تسمية موحدة لسهولة الـ Purge على Cloudflare/Cloudways
        chunkFileNames:  'assets/js/[name]-[hash].js',
        entryFileNames:  'assets/js/[name]-[hash].js',
        assetFileNames:  'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  // ── حذف console.log و debugger من الإنتاج ──
  esbuild: mode === 'production' ? {
    drop:          ['console', 'debugger'],
    legalComments: 'none',               // حذف تعليقات الترخيص من الـ bundle
  } : {},

  server: {
    proxy: {
      '/api': {
        target:      process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure:      false,
      },
    },
  },
}))
