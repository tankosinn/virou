import type { RouterContext } from 'rou3'
import type { AsyncComponentLoader, Component, ComputedRef } from 'vue'

export type VRouteTreeNode = [key: string, children?: VRouteTreeNode[]]

export type VRouteViews = Record<string, Component[]>

export type VRouteKeys = Record<string, Array<string | null>>

export type VRouteRenderView = [key: string, component: Component]

export interface VRouteRecordRaw {
  key?: string
  path: string
  component: AsyncComponentLoader<Component>
  meta?: Record<string, any>
  children?: VRouteRecordRaw[]
}

export interface VRouteMatchedData {
  key?: string
  fullPath: string
  meta?: Record<string, any>
}

export interface VRouterInstance {
  context: RouterContext<VRouteMatchedData>
  routeTree: VRouteTreeNode[]
  views: VRouteViews
  keys: VRouteKeys
}

export interface VRouterOptions {
  initialPath: string
}

export interface VRouter {
  route: ComputedRef<{
    fullPath: string
    data?: VRouteMatchedData
    params?: Record<string, string>
    path: string
    search: string
    hash: string
    activeRouteTree?: string[]
    renderList?: VRouteRenderView[]
  }>
  router: {
    addRoute: (route: VRouteRecordRaw) => void
    replace: (path: string) => void
    _key: string
    _depthKey: symbol
  }
}
