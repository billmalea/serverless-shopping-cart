import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default ({ mode }) => {
  // Load env variables so `VITE_API_URL` can be used here
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_URL || '').replace(/\/+$/, '') || 'http://localhost:3000'

  return defineConfig({
    plugins: [vue()],
    server: {
      port: 3000,
      proxy: {
        // Proxy /api/* to the API defined in `VITE_API_URL` to avoid CORS in development
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  })
}
