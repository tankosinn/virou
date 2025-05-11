import type { VRouteId, VRouteMatchedData, VRouteNormalized, VRouteRaw, VRoutesMap } from '@virou/core'
import type { RouterContext } from 'rou3'
import type { Component } from 'vue'
import { createRouter, findRoute } from 'rou3'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineAsyncComponent } from 'vue'
import { createRenderList, registerRoutes } from '../src/utils'

function getRouteEntry(registry: VRoutesMap, path: string, depth: number): [VRouteId, VRouteNormalized] {
  const routeEntry = Array.from(registry.entries()).find(
    ([id]) => id[0] === path && id[1] === depth,
  )
  if (!routeEntry) {
    throw new Error(`Route not found: ${path} at depth ${depth}`)
  }
  return routeEntry
}

describe('utils', () => {
  let ctx: RouterContext<VRouteMatchedData>
  let registry: VRoutesMap

  beforeEach(() => {
    ctx = createRouter()
    registry = new Map()
  })

  describe('registerRoutes', () => {
    it('should register a top-level route', () => {
      const Home: Component = { name: 'Home', render: () => null }
      const routes: VRouteRaw[] = [{
        path: '/',
        component: Home,
        meta: { title: 'Home' },
      }]

      registerRoutes(ctx, routes, registry)

      expect(registry.size).toBe(1)

      const [id, route] = getRouteEntry(registry, '/', 0)
      expect(Object.isFrozen(id)).toBe(true)
      expect(id).toEqual(['/', 0])
      expect(route.component).toBe(Home)
      expect(route.meta).toEqual({ title: 'Home' })
      expect(route.parentId).toBeUndefined()

      const match = findRoute(ctx, 'GET', '/')
      expect(match).toBeDefined()
      expect(match?.data.id).toEqual(id)
    })

    it('should handle nested routes', () => {
      const Parent: Component = { name: 'Parent', render: () => null }
      const Child: Component = { name: 'Child', render: () => null }
      const Grandchild: Component = { name: 'Grandchild', render: () => null }

      const routes: VRouteRaw[] = [
        {
          path: '/parent',
          component: Parent,
          children: [
            { path: '', component: Child, meta: { depth: 1 } },
            { path: 'grand', component: Grandchild },
          ],
        },
      ]

      registerRoutes(ctx, routes, registry)

      expect(registry.size).toBe(3)
      const [, dataChild] = getRouteEntry(registry, '/parent', 1)
      expect(dataChild.meta).toEqual({ depth: 1 })
      expect(dataChild.parentId).toEqual(['/parent', 0])

      const [, dataGrand] = getRouteEntry(registry, '/parent/grand', 1)
      expect(dataGrand.parentId).toEqual(['/parent', 0])

      expect(findRoute(ctx, 'GET', '/parent')?.data.id).toEqual(['/parent', 1])
      expect(findRoute(ctx, 'GET', '/parent/grand')?.data.id).toEqual(['/parent/grand', 1])
    })

    it('should let default-child override parent when matching', () => {
      const routes: VRouteRaw[] = [
        {
          path: '/parent',
          component: () => null,
          meta: { foo: 'bar' },
          children: [
            { path: '', component: () => null, meta: { foo: 'baz' } },
          ],
        },
      ]

      registerRoutes(ctx, routes, registry)

      const match = findRoute(ctx, 'GET', '/parent')
      expect(match).toBeDefined()

      expect(match!.data.id).toEqual(['/parent', 1])
      expect(match!.data.meta).toEqual({ foo: 'baz' })
    })

    it('should normalize components', async () => {
      const StaticComponent: Component = { name: 'Static', render: () => null }
      const AsyncComponent: Component = defineAsyncComponent(async () => ({ name: 'Async', render: () => null }))
      const LazyComponent: Component = async () => Promise.resolve({ name: 'Lazy', render: () => null })

      const routes: VRouteRaw[] = [
        { path: '/static', component: StaticComponent },
        { path: '/async', component: AsyncComponent },
        { path: '/lazy', component: LazyComponent },
      ]

      registerRoutes(ctx, routes, registry)

      const [, dataStatic] = getRouteEntry(registry, '/static', 0)
      expect(dataStatic.component).toBe(StaticComponent)

      const [, dataAsync] = getRouteEntry(registry, '/async', 0)
      expect(dataAsync.component).toBe(AsyncComponent)

      const [, dataLazy] = getRouteEntry(registry, '/lazy', 0)
      expect(dataLazy.component).not.toBe(LazyComponent)
      // @ts-expect-error internal loader
      expect(typeof dataLazy.component.__asyncLoader).toBe('function')
    })
  })

  describe('createRenderList', () => {
    it('should create the render list in parent-to-child order', () => {
      const A: Component = { name: 'A', render: () => null }
      const B: Component = { name: 'B', render: () => null }
      const C: Component = { name: 'C', render: () => null }

      const routes: VRouteRaw[] = [
        {
          path: '/a',
          component: A,
          children: [
            {
              path: 'b',
              component: B,
              children: [
                { path: 'c', component: C },
              ],
            },
          ],
        },
      ]

      registerRoutes(ctx, routes, registry)
      const match = findRoute(ctx, 'GET', '/a/b/c')!
      const list = createRenderList(match.data, registry)
      expect(list.map(c => c.name)).toEqual(['A', 'B', 'C'])
    })

    it('should place default-child at the correct position', () => {
      const Parent: Component = { name: 'Parent', render: () => null }
      const Child: Component = { name: 'Child', render: () => null }

      const routes: VRouteRaw[] = [
        {
          path: '/parent',
          component: Parent,
          children: [
            { path: '', component: Child },
          ],
        },
      ]

      registerRoutes(ctx, routes, registry)
      const match = findRoute(ctx, 'GET', '/parent')!
      const list = createRenderList(match.data, registry)
      expect(list.map(c => c.name)).toEqual(['Parent', 'Child'])
    })

    it('should return the same array instance on repeated calls (cache)', () => {
      const A: Component = { name: 'A', render: () => null }
      const routes: VRouteRaw[] = [{ path: '/a', component: A }]
      registerRoutes(ctx, routes, registry)

      const match = findRoute(ctx, 'GET', '/a')!
      const first = createRenderList(match.data, registry)
      const second = createRenderList(match.data, registry)
      expect(second).toBe(first)
    })

    it('should return an empty array for a non-matched route', () => {
      const fakeData = { id: ['/', 0] as const, meta: {}, params: undefined }
      const list = createRenderList(fakeData as VRouteMatchedData, registry)
      expect(list).toEqual([])
    })
  })
})
