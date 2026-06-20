import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/exports.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'exports',
    },
    outDir: 'dist/browser',
  },
})
