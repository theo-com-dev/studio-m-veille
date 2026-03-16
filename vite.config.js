import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/search': {
          target: 'https://google.serper.dev',
          changeOrigin: true,
          rewrite: () => '/search',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-API-KEY', env.SERPER_API_KEY || '')
            })
          },
        },
        '/api/maps': {
          target: 'https://google.serper.dev',
          changeOrigin: true,
          rewrite: () => '/maps',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-API-KEY', env.SERPER_API_KEY || '')
            })
          },
        },
      },
    },
  }
})
