import type { VRouteId, VRouteMatchedData, VRouteNormalized, VRouteRaw, VRoutesMap } from '@virou/core'
import type { Component } from 'vue'
import { createVRouter } from '@virou/core'
import { createRouter, findRoute } from 'rou3'
import { describe, expect, it } from 'vitest'
import { defineAsyncComponent } from 'vue'
import { registerRoutes } from '../src/router/register'
import { createRenderList } from '../src/router/render'

function getRouteEntry(registry: VRoutesMap, path: string, depth: number): [VRouteId, VRouteNormalized] {
  const routeEntry = Array.from(registry.entries()).find(
    ([id]) => id[0] === path && id[1] === depth,
  )
  if (!routeEntry) {
    throw new Error(`Route not found: ${path} at depth ${depth}`)
  }
  return routeEntry
}

describe('router:create', () => {
  it('should create router', () => {
    const routes: VRouteRaw[] = [{ path: '/', component: { name: 'Home' }, meta: { foo: 'bar' } }]

    const routerData = createVRouter(routes)

    expect(routerData.routes.size).toBe(1)
    expect(routerData.activePath.value).toBe('/')

    const route = routerData.route.value

    expect(route.path).toBe('/')
    expect(route.fullPath).toBe('/')
    expect(route.params).toBeUndefined()
    expect(route.search).toBe('')
    expect(route.hash).toBe('')

    expect(route.meta).toEqual({ foo: 'bar' })

    expect(route['~renderList']).toEqual([{ name: 'Home' }])

    expect(routerData.isGlobal).toBe(false)
    expect(routerData['~deps']).toBe(0)
  })

  it('should create global router', () => {
    const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

    const routerData = createVRouter(routes, {
      isGlobal: true,
    })

    expect(routerData.isGlobal).toBe(true)
    expect(routerData['~deps']).toBe(0)
  })

  it('should create router with initial path', () => {
    const routes: VRouteRaw[] = [
      {
        path: '/',
        component: { name: 'Home' },
        meta: { foo: 'bar' },
      },
      {
        path: '/about',
        component: { name: 'About' },
        meta: { foo: 'baz' },
      },
    ]

    const routerData = createVRouter(routes, {
      initialPath: '/about',
    })

    expect(routerData.activePath.value).toBe('/about')

    const route = routerData.route.value

    expect(route.path).toBe('/about')
    expect(route.fullPath).toBe('/about')
  })
})

describe('router:register', () => {
  it('should register a top-level route', () => {
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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

describe('router:render', () => {
  it('should create the render list in parent-to-child order', () => {
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

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
    const ctx = createRouter<VRouteMatchedData>()
    const registry = new Map<VRouteId, VRouteNormalized>()

    const A: Component = { name: 'A', render: () => null }
    const routes: VRouteRaw[] = [{ path: '/a', component: A }]
    registerRoutes(ctx, routes, registry)

    const match = findRoute(ctx, 'GET', '/a')!
    const first = createRenderList(match.data, registry)
    const second = createRenderList(match.data, registry)
    expect(second).toBe(first)
  })

  it('should return an empty array for a non-matched route', () => {
    const registry = new Map<VRouteId, VRouteNormalized>()
    const fakeData = { id: ['/', 0] as const, meta: {}, params: undefined }
    const list = createRenderList(fakeData as VRouteMatchedData, registry)
    expect(list).toEqual([])
  })
})
