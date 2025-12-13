import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: true,
  format: 'esm',
  fixedExtension: false,
  platform: 'browser',
  dts: true,
  external: [/^@virou\/.*$/],
})
