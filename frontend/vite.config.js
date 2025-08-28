// dlya localhost
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})


// // dlya docker
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://backend:8000',
//         changeOrigin: true,
//         secure: false
//       },
//     },
//   },
// })