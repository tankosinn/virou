import type { VRouter, VRouteRecordRaw, VRouterInstance, VRouterOptions } from './types'
import { createGlobalState } from '@vueuse/core'
import { createRouter, findRoute } from 'rou3'
import { parseURL } from 'ufo'
import { computed, inject, provide, ref, shallowRef, useId } from 'vue'
import { addRoutes, createRenderList, resolveRouteTree } from './utils'

export const virouSymbol = Symbol('virou')

const useVirouState = createGlobalState(() => {
  const routers = shallowRef<Record<string, VRouterInstance>>({})

  const activeRoutePaths = ref<Record<string, string>>({})

  return { routers, activeRoutePaths }
})

export function createVRouter(key: string, routes: VRouteRecordRaw[], options?: VRouterOptions) {
  const { routers, activeRoutePaths } = useVirouState()

  if (key in routers.value) {
    throw new Error(`[virou] [createVRouter] key already exists: ${key}`)
  }

  routers.value[key] = {
    context: createRouter(),
    routeTree: [],
    views: {},
    keys: {},
  }

  addRoutes(routers.value[key], routes)

  const { initialPath } = options ||= {
    initialPath: '/',
  }

  activeRoutePaths.value[key] = initialPath
}

/**
 * Creates or retrieves a virtual router
 *
 * @param key - a unique identifier for the router
 * @param routes - a list of routes to add to the router
 * @param options - configuration options for the router
 *
 * @returns an object containing:
 *   - `route`: reactive data for the current route (e.g., path, fullPath, query, etc.)
 *   - `router`: utilities to manage the router (e.g., `addRoute`, `replace`)
 */
export function useVRouter(key?: string, routes?: VRouteRecordRaw[], options?: VRouterOptions): VRouter
export function useVRouter(routes?: VRouteRecordRaw[], options?: VRouterOptions): VRouter
export function useVRouter(...args: any[]): VRouter {
  if (typeof args[0] !== 'string') {
    args.unshift(inject<string>(virouSymbol, useId()))
  }
  const [key, routes] = args as [string, VRouteRecordRaw[]]

  if (!key || typeof key !== 'string') {
    throw new TypeError(`[virou] [useVRouter] key must be a string: ${key}`)
  }

  provide(virouSymbol, key)

  const options = args[2] as VRouterOptions | undefined

  const { routers, activeRoutePaths } = useVirouState()

  if (routers.value[key] === undefined) {
    if (routes === undefined) {
      throw new Error(`[virou] [useVRouter] routes is required for key: ${key}`)
    }

    createVRouter(key, routes, options)
  }

  const route = computed(() => {
    const { context, routeTree, views, keys } = routers.value[key]

    const activeRoutePath = activeRoutePaths.value[key]

    const matchedRoute = findRoute(
      context,
      'GET',
      activeRoutePath,
    )

    const activeRouteTree = matchedRoute && resolveRouteTree(routeTree, matchedRoute.data.fullPath)

    const { search, pathname, hash } = parseURL(activeRoutePath)

    const renderList = activeRouteTree && createRenderList(activeRouteTree, pathname, views, keys)

    return {
      fullPath: activeRoutePath,
      ...matchedRoute,
      search,
      path: pathname,
      hash,
      activeRouteTree,
      renderList,
    }
  })

  return {
    route,
    router: {
      addRoute: (route: VRouteRecordRaw) => {
        addRoutes(routers.value[key], [route])
      },
      replace: (path: string) => {
        activeRoutePaths.value[key] = path
      },
      _key: key,
      _depthKey: Symbol.for(key),
    },
  }
}
