import type { VRouteKeys, VRouteRecordRaw, VRouteRenderView, VRouterInstance, VRouteTreeNode, VRouteViews } from './types'
import { addRoute } from 'rou3'
import { joinURL } from 'ufo'
import { defineAsyncComponent } from 'vue'

export function addRoutes(router: VRouterInstance, routes: VRouteRecordRaw[], parentPath = ''): void {
  const { context, routeTree, views, keys } = router

  routes.forEach(({ key, path, component, meta, children }) => {
    const fullPath = joinURL(parentPath, path)

    views[fullPath] ||= []
    views[fullPath].push(defineAsyncComponent(component))

    keys[fullPath] ||= []
    keys[fullPath].push(key ?? null)

    addRoute(context, 'GET', fullPath, { key, fullPath, meta })

    const node: VRouteTreeNode = [fullPath]
    if (children) {
      const childRouteTree: VRouteTreeNode[] = []
      addRoutes({ ...router, routeTree: childRouteTree }, children, fullPath)
      node[1] = childRouteTree
    }

    routeTree.push(node)
  })
}

export function resolveRouteTree(
  routeTree: VRouteTreeNode[],
  targetPath: string,
  accumulatedPaths: string[] = [],
): string[] {
  for (const [path, children] of routeTree) {
    const paths = [...accumulatedPaths, path]

    if (path === targetPath) {
      return paths
    }

    if (children) {
      const result = resolveRouteTree(children, targetPath, paths)
      if (result.length) {
        return result
      }
    }
  }

  return []
}

export function createRenderList(
  routes: string[],
  targetPath: string,
  views: VRouteViews,
  keys: VRouteKeys,
): VRouteRenderView[] {
  const renderList: VRouteRenderView[] = []
  const currentSegments = targetPath.split('/').filter(Boolean)

  routes.forEach((path) => {
    const treeViews = views[path]
    const treeKeys = keys[path]

    if (treeViews === undefined || treeKeys === undefined || treeViews.length !== treeKeys.length) {
      throw new Error(`[virou] Mismatch or missing data for path: ${path}`)
    }

    const resolvedPath = joinURL('/', ...currentSegments.slice(0, path.split('/').filter(Boolean).length))

    for (let i = 0; i < treeViews.length; i++) {
      const view = treeViews[i]
      const key = treeKeys[i] as string | undefined

      if (view !== undefined && key !== undefined && (targetPath === resolvedPath || i === 0)) {
        renderList.push([key ?? resolvedPath, view])
      }
    }
  })

  return renderList
}
