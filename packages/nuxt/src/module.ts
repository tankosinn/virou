import { defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'virou',
    configKey: 'virou',
  },
  defaults: {},
  setup(_options, _nuxt) {},
})
