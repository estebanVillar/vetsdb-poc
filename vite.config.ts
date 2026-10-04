import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Repo público de GitHub Pages: se sirve en https://<usuario>.github.io/vetsdb-poc/,
  // así que los assets deben referenciarse con ese prefijo.
  base: '/vetsdb-poc/',
  plugins: [react(), tailwindcss()],
})
