import type { VirouPluginOptions } from '@virou/core'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

const _dirname = dirname(fileURLToPath(import.meta.url))

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
    nuxt.options.runtimeConfig.public.virou = defu(nuxt.options.runtimeConfig.public.virou, options)

    const pluginPath = resolve(_dirname, './plugin.mjs')
    nuxt.options.plugins = nuxt.options.plugins ?? []
    nuxt.options.plugins.push(pluginPath)
    nuxt.options.build.transpile.push(pluginPath)

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
