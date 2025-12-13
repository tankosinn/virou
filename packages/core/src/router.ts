import type { VRoute, VRouteMatchedData, VRouter, VRouteRaw, VRouterData, VRouterOptions, VRoutesMap } from './types'
import { createRouter, findRoute } from 'rou3'
import { parseURL } from 'ufo'
import { getCurrentInstance, inject, onScopeDispose, provide, ref, shallowRef, useId, watchEffect } from 'vue'
import { createRenderList, registerRoutes } from './utils'

export const virouSymbol = Symbol('virou')

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

export function useVRouter(routes?: VRouteRaw[], options?: VRouterOptions): VRouter
export function useVRouter(key?: string, routes?: VRouteRaw[], options?: VRouterOptions): VRouter
export function useVRouter(...args: any[]): VRouter {
  if (typeof args[0] !== 'string') {
    args.unshift(inject<string>(virouSymbol, useId()))
  }

  const [key, routes = [], options = {}] = args as [string, VRouteRaw[], VRouterOptions]

  if (!key || typeof key !== 'string') {
    throw new TypeError(`[virou] [useVRouter] key must be a string: ${key}`)
  }

  provide(virouSymbol, key)

  const vm = getCurrentInstance()
  if (!vm) {
    throw new Error('[virou] [useVRouter] useVRouter must be called in setup()')
  }

  const virou = vm.proxy?.$virou
  if (!virou) {
    throw new Error('[virou] [useVRouter] virou plugin not installed')
  }

  if (routes.length) {
    if (virou.get(key)) {
      throw new Error(`[virou] [useVRouter] router with key "${key}" already exists`)
    }

    virou.set(key, createVRouter(routes, options))
  }

  const router = virou.get(key)
  if (!router) {
    throw new Error(`[virou] [useVRouter] router with key "${key}" not found`)
  }

  router['~deps']++
  onScopeDispose(() => {
    router['~deps']--

    if (router['~deps'] === 0 && !router.isGlobal) {
      router['~dispose']()
      virou.delete(key)
    }
  })

  return {
    route: router.route,
    router: {
      addRoute: (route: VRouteRaw) => {
        registerRoutes(router.context, [route], router.routes)
      },
      replace: (path: string) => {
        router.activePath.value = path
      },
      '~depthKey': Symbol.for(key),
    },
  }
}
