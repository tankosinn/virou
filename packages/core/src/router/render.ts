import type { Component } from 'vue'
import type { VRouteId, VRouteMatchedData, VRouteRenderComponent, VRoutesMap } from '../types'

const renderListCache = new WeakMap<VRoutesMap, Map<VRouteId, Component[]>>()

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
  let idx = depth
  let cursor = routes.get(data.id)
  while (cursor) {
    list[idx--] = cursor.component
    cursor = cursor.parentId !== undefined ? routes.get(cursor.parentId) : undefined
  }

  cacheForRoutes.set(data.id, list)
  return list
}
