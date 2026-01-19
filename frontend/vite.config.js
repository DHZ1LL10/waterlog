import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // <--- IMPORTANTE: Permite ver la app desde fuera del contenedor
    port: 3001,      // <--- Forzamos el puerto 3001
    strictPort: true,
    watch: {
      usePolling: true, // <--- CRÍTICO EN WINDOWS: Hace que los cambios se vean al instante (HMR)
    },
  },
})