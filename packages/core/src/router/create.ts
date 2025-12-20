import type {
  VRoute,
  VRouteId,
  VRouteMatchedData,
  VRouteRaw,
  VRouterData,
  VRouteRenderComponent,
  VRouterOptions,
  VRoutesMap,
} from '../types'
import { createRouter, findRoute } from 'rou3'
import { parseURL } from 'ufo'
import { shallowRef, watchEffect } from 'vue'
import { registerRoutes } from './register'
import { createRenderList } from './render'

export function createVRouter(routes: VRouteRaw[], options?: VRouterOptions): VRouterData {
  const context = createRouter<VRouteMatchedData>()
  const routeRegistry: VRoutesMap = new Map()

  registerRoutes(context, routes, routeRegistry)

  let lastMatchedId: VRouteId | undefined
  let lastRenderList: VRouteRenderComponent[] | null = null

  const activePath = shallowRef(options?.initialPath ?? '/')

  const snapshot = (): VRoute => {
    const matchedRoute = findRoute(context, 'GET', activePath.value)
    if (matchedRoute) {
      if (matchedRoute.data.id !== lastMatchedId) {
        lastRenderList = createRenderList(matchedRoute.data, routeRegistry)
        lastMatchedId = matchedRoute.data.id
      }
    }
    else {
      lastMatchedId = undefined
      lastRenderList = null
    }

    const { pathname, hash, search } = parseURL(activePath.value)

    return {
      fullPath: activePath.value,
      path: pathname,
      search,
      hash,
      meta: matchedRoute?.data.meta,
      params: matchedRoute?.params,
      '~renderList': lastRenderList,
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
