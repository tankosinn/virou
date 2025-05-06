import type { RouterContext } from 'rou3'
import type { Component } from 'vue'
import type { VRouteId, VRouteLazyComponent, VRouteMatchedData, VRouteRaw, VRouteRenderComponent, VRoutesMap } from './types'
import { addRoute } from 'rou3'
import { joinURL } from 'ufo'
import { defineAsyncComponent } from 'vue'

const renderListCache = new WeakMap<VRoutesMap, Map<VRouteId, Component[]>>()

function normalizeComponent(component: VRouteRenderComponent): Component {
  if (typeof component === 'function' && (component as VRouteLazyComponent).length === 0) {
    return defineAsyncComponent(component as VRouteLazyComponent)
  }
  return component as Component
}

export function registerRoutes(
  ctx: RouterContext<VRouteMatchedData>,
  routes: VRouteRaw[],
  registry: VRoutesMap,
  parentId?: VRouteId,
) {
  for (const { path, meta, component, children } of routes) {
    const fullPath = joinURL(parentId?.[0] ?? '/', path)
    const depth = (parentId?.[1] ?? 0) + 1

    const id: VRouteId = Object.freeze([fullPath, depth])

    addRoute(ctx, 'GET', fullPath, { id, meta })

    registry.set(id, {
      meta,
      component: normalizeComponent(component),
      parentId,
    })

    if (children && children.length) {
      registerRoutes(ctx, children, registry, id)
    }
  }
}

export function createRenderList(
  data: VRouteMatchedData,
  routes: VRoutesMap,
): VRouteRenderComponent[] {
  let cacheForRoutes = renderListCache.get(routes)
  if (!cacheForRoutes) {
    cacheForRoutes = new Map<VRouteId, Component[]>()
    renderListCache.set(routes, cacheForRoutes)
  }

  const cached = cacheForRoutes.get(data.id)
  if (cached) {
    return cached
  }

  const depth = data.id[1]
  const list = Array.from<VRouteRenderComponent>({ length: depth })
  let idx = depth - 1
  let cursor = routes.get(data.id)
  while (cursor) {
    list[idx--] = cursor.component
    cursor = cursor.parentId !== undefined ? routes.get(cursor.parentId) : undefined
  }

  cacheForRoutes.set(data.id, list)
  return list
}
