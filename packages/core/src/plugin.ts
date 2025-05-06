import type { Plugin } from 'vue'
import type { VirouPluginOptions, VRouterData } from './types'
import { VRouterView } from './component'
import { createVRouter } from './router'

export const virou: Plugin<[VirouPluginOptions?]> = (app, options = {}) => {
  const { routers } = options

  const map = new Map<string, VRouterData>()
  app.config.globalProperties.$virou = map

  app.component('VRouterView', VRouterView)

  if (routers) {
    for (const [key, router] of Object.entries(routers)) {
      map.set(key, createVRouter(router.routes, { ...router.options, _isGlobal: true }))
    }
  }
}
