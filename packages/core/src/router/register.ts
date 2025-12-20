import type { RouterContext } from 'rou3'
import type { VRouteId, VRouteMatchedData, VRouteRaw, VRoutesMap } from '../types'
import { addRoute } from 'rou3'
import { joinURL } from 'ufo'
import { normalizeComponent } from '../utils'

export function registerRoutes(
  ctx: RouterContext<VRouteMatchedData>,
  routes: VRouteRaw[],
  registry: VRoutesMap,
  parentId?: VRouteId,
): void {
  for (const { path, meta, component, children } of routes) {
    const fullPath = joinURL(parentId?.[0] ?? '/', path)
    const depth = (parentId?.[1] ?? -1) + 1

    const id: VRouteId = Object.freeze([fullPath, depth])

    registry.set(id, {
      meta,
      component: normalizeComponent(component),
      parentId,
    })

    if (children && children.length) {
      registerRoutes(ctx, children, registry, id)
    }

    addRoute(ctx, 'GET', fullPath, { id, meta })
  }
}
