
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Use type assertion for process to access cwd() method in environments with incomplete type definitions
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Optimización de chunks
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar React en su propio chunk
            'react-vendor': ['react', 'react-dom'],
            // Separar Google GenAI en su propio chunk
            'genai': ['@google/genai'],
            // Separar Supabase en su propio chunk
            'supabase': ['@supabase/supabase-js']
          }
        }
      },
      // Optimizar tamaño de chunks
      chunkSizeWarningLimit: 600,
      // Minificación agresiva
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Eliminar console.logs en producción
          drop_debugger: true
        }
      }
    }
  };
});
