import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/erptakt/',
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      data: path.resolve(__dirname, './src/data'),
      helpers: path.resolve(__dirname, './src/helpers'),
      hooks: path.resolve(__dirname, './src/hooks'),
      lib: path.resolve(__dirname, './src/lib'),
      pages: path.resolve(__dirname, './src/pages'),
      providers: path.resolve(__dirname, './src/providers'),
      reducers: path.resolve(__dirname, './src/reducers'),
      routes: path.resolve(__dirname, './src/routes'),
      services: path.resolve(__dirname, './src/services'),
      styles: path.resolve(__dirname, './src/styles'),
      theme: path.resolve(__dirname, './src/theme'),
      types: path.resolve(__dirname, './src/types'),
      config: path.resolve(__dirname, './src/config.ts')
    }
  },
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Não reescrever a path, manter /api/...
      }
    }
  }
})
