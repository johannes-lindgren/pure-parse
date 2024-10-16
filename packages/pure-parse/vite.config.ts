import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      preserveEntrySignatures: 'exports-only',
      output: [
        {
          // ESM build
          format: 'es',
          entryFileNames: '[name].js',
          dir: 'dist',
          preserveModules: true, // Keeps module structure
          preserveModulesRoot: 'src',
        },
        {
          // CJS build
          format: 'cjs',
          entryFileNames: '[name].cjs',
          dir: 'dist',
          preserveModules: true, // Keeps module structure
          preserveModulesRoot: 'src',
        },
      ],
    },
  },
})
