import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// `base` matches the GitHub Pages project path: https://<user>.github.io/quiniu_speak/
// Use '/' instead if deploying to a custom domain or the <user>.github.io root repo.
export default defineConfig({
  base: '/quiniu_speak/',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist' },
})