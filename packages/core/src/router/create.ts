import type { VRoute, VRouteMatchedData, VRouteRaw, VRouterData, VRouterOptions, VRoutesMap } from '../types'
import { createRouter, findRoute } from 'rou3'
import { parseURL } from 'ufo'
import { ref, shallowRef, watchEffect } from 'vue'
import { registerRoutes } from './register'
import { createRenderList } from './render'

export function createVRouter(routes: VRouteRaw[], options?: VRouterOptions): VRouterData {
  const context = createRouter<VRouteMatchedData>()
  const routeRegistry: VRoutesMap = new Map()
  registerRoutes(context, routes, routeRegistry)

  const activePath = ref(options?.initialPath ?? '/')

  const snapshot = (): VRoute => {
    const matchedRoute = findRoute(context, 'GET', activePath.value)
    const renderList = matchedRoute ? createRenderList(matchedRoute.data, routeRegistry) : null
    const { pathname, hash, search } = parseURL(activePath.value)
    return {
      fullPath: activePath.value,
      path: pathname,
      search,
      hash,
      meta: matchedRoute?.data.meta,
      params: matchedRoute?.params,
      '~renderList': renderList,
    }
  }

  const route = shallowRef<VRoute>(snapshot())

  const unwatch = watchEffect(() => {
    route.value = snapshot()
  })

  return {
    context,
    routes: routeRegistry,
    activePath,
    route,
    isGlobal: options?.isGlobal ?? false,
    '~deps': 0,
    '~dispose': unwatch,
  }
}
