import type { VirouPluginOptions } from '@virou/core'
import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

const functions = [
  'useVRouter',
]

const components = [
  'VRouterView',
]

export interface ModuleOptions extends VirouPluginOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@virou/nuxt',
    configKey: 'virou',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.virou = defu(nuxt.options.runtimeConfig.public.virou, options)

    addPlugin(resolver.resolve('./runtime/plugin'))

    functions.forEach((name) => {
      addImports({ name, as: name, from: '@virou/core', priority: -1 })
    })

    components.forEach((name) => {
      addComponent({ name, export: name, filePath: '@virou/core', priority: -1 })
    })
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    virou?: ModuleOptions
  }
}
