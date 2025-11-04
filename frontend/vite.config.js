import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), 
    react()
  ],
  server:{port:8000},
  theme:{
    extend: {
      colors:{
        primary:"5f6FFF"
      }
    }
  }
})
