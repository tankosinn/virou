import { virou } from '@virou/core'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const options = useRuntimeConfig().public.virou

  nuxtApp.vueApp.use(virou, options)
})
