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



// // dlya docker new rabotaet
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://192.168.0.2:8000',
//         changeOrigin: true,
//         secure: false
//       },
//     },
//   },
// })

// // dlya docker new rabotaet
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://192.168.25.74:8001',
//         changeOrigin: true,
//         secure: false
//       },
//     },
//   },
// })








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


// // dlya docker 2
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// const API_BASE = import.meta.env.VITE_BASE_URL;

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: API_BASE,
//         changeOrigin: true,
//         secure: false
//       },
//     },
//   },
// })


// // dlya docker new rabotaet
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://192.168.25.74:8000',
//         changeOrigin: true,
//         secure: false
//       },
//     },
//   },
// })

