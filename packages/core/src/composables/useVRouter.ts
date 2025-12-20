import type { VRouter, VRouteRaw, VRouterOptions } from '../types'
import { getCurrentInstance, inject, onScopeDispose, provide, useId } from 'vue'
import { virouSymbol } from '../constants'
import { createVRouter, registerRoutes } from '../router'

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
