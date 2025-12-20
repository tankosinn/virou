import type { RouterContext } from 'rou3'
import type { VRouteId, VRouteMatchedData, VRouteRaw, VRoutesMap } from '../types'
import { addRoute } from 'rou3'
import { joinURL } from 'ufo'
import { normalizeComponent } from '../utils'

interface StackItem {
  route: VRouteRaw
  parentId?: VRouteId
}

export function registerRoutes(
  ctx: RouterContext<VRouteMatchedData>,
  routes: VRouteRaw[],
  registry: VRoutesMap,
): void {
  const stack: StackItem[] = []
  for (let i = routes.length - 1; i >= 0; i--) {
    stack.push({ route: routes[i] })
  }

  while (stack.length > 0) {
    const { route, parentId } = stack.pop()!
    const { path, meta, component, children } = route

    const parentPath = parentId?.[0] ?? '/'
    const fullPath = joinURL(parentPath, path)
    const depth = (parentId?.[1] ?? -1) + 1
    const id: VRouteId = Object.freeze([fullPath, depth])

    registry.set(id, {
      meta,
      component: normalizeComponent(component),
      parentId,
    })

    let isShadowed = false
    if (children && children.length > 0) {
      isShadowed = children.some(c => c.path === '' || c.path === '/')

      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({ route: children[i], parentId: id })
      }
    }

    if (!isShadowed) {
      addRoute(ctx, 'GET', fullPath, { id, meta })
    }
  }
}
