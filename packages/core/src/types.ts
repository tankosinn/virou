import type { RouterContext } from 'rou3'
import type { Component, ComputedRef, DefineComponent, Ref } from 'vue'

type Lazy<T> = () => Promise<T>

export type VRouteComponent = Component | DefineComponent
export type VRouteLazyComponent = Lazy<VRouteComponent>
export type VRouteRenderComponent = VRouteComponent | VRouteLazyComponent

export type VRouteMeta = Record<PropertyKey, unknown>

export interface VRouteRaw {
  path: string
  component: VRouteRenderComponent
  meta?: VRouteMeta
  children?: VRouteRaw[]
}

export type VRouteId = Readonly<[path: string, depth: number]>

export interface VRouteMatchedData {
  id: VRouteId
  meta?: VRouteMeta
}

export interface VRouteNormalized extends Omit<VRouteRaw, 'path' | 'children'> {
  parentId?: VRouteId
}

export type VRoutesMap = Map<VRouteId, VRouteNormalized>

export interface VRoute {
  fullPath: string
  meta?: VRouteMeta
  params?: Record<string, string>
  path: string
  search: string
  hash: string
  _renderList: Component[] | null
}

export interface VRouterData {
  context: RouterContext<VRouteMatchedData>
  routes: VRoutesMap
  activePath: Ref<string>
  route: ComputedRef<VRoute>
  _isGlobal: boolean
  _deps: number
}

export interface VRouterOptions {
  initialPath?: string
  _isGlobal?: boolean
}

export interface VRouter {
  route: VRouterData['route']
  router: {
    addRoute: (route: VRouteRaw) => void
    replace: (path: string) => void
    _depthKey: symbol
  }
}

export interface VirouPluginOptions {
  routers?: Record<string, {
    routes: VRouteRaw[]
    options?: Omit<VRouterOptions, '_isGlobal'>
  }>
}
