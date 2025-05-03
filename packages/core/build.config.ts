import { rm } from 'node:fs/promises'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  hooks: {
    'build:done': async function () {
      await rm('dist/index.d.ts')
    },
  },
})
