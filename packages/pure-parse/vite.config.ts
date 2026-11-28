import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      preserveEntrySignatures: 'exports-only',
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          dir: 'dist',
          preserveModules: true,
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          dir: 'dist',
          preserveModules: true,
        },
      ],
    },
  },
})
