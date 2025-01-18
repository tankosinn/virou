import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'

const functions = [
  'useVRouter',
]

const components = [
  'VRouterView',
]

export default defineNuxtModule({
  meta: {
    name: 'virou',
  },
  setup(_options, _nuxt) {
    functions.forEach((name) => {
      addImports({ name, as: name, from: '@virou/core', priority: -1 })
    })

    components.forEach((name) => {
      void addComponent({ name, export: name, filePath: '@virou/core', priority: -1 })
    })
  },
})
