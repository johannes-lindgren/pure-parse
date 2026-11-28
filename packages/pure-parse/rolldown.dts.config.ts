import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

// Bundles the type declarations into dist/index.d.ts
export default defineConfig({
  input: { index: 'src/index.ts' },
  plugins: [dts({ emitDtsOnly: true })],
  output: { dir: 'dist', format: 'es' },
})
