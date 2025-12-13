import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { virou } from '@virou/core'

export default defineNuxtPlugin((nuxtApp) => {
  const options = useRuntimeConfig().public.virou

  nuxtApp.vueApp.use(virou, options)
})
