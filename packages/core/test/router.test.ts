import type { VRoute, VRouteRaw } from '@virou/core'
import { createVRouter, useVRouter, virou } from '@virou/core'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useSetup, useSetupWithPlugin } from './_utils'

describe('router', () => {
  describe('createVRouter', () => {
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

  describe('useVRouter', () => {
    afterEach(() => {
      vi.resetModules()
      vi.clearAllMocks()
    })

    it('should throw error when plugin is not installed', () => {
      expect(() => useSetup(() => useVRouter())).toThrowError('[virou] [useVRouter] virou plugin not installed')
    })

    it('should throw error when key is not a non-empty string', () => {
      expect(() => useSetupWithPlugin(() => useVRouter(''))).toThrowError('[virou] [useVRouter] key must be a string: ')
    })

    it('should throw error when useVRouter is not called in setup()', () => {
      expect(() => useVRouter('foo')).toThrowError('[virou] [useVRouter] useVRouter must be called in setup()')
    })

    it('should throw error when router with key already exists', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      expect(() => useSetupWithPlugin(() => {
        useVRouter('foo', routes)
        useVRouter('foo', routes)
      })).toThrowError('[virou] [useVRouter] router with key "foo" already exists')
    })

    it('should throw error when router with key does not exist', () => {
      expect(() => useSetupWithPlugin(() => useVRouter('foo'))).toThrowError('[virou] [useVRouter] router with key "foo" not found')
    })

    it('should create router with key', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      const wrapper = useSetupWithPlugin(() => {
        useVRouter('foo', routes)
      })

      const virou = wrapper.vm.$virou

      expect(virou.has('foo')).toBe(true)
    })

    it('should create router without key', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      vi.mock(import('vue'), async (importOriginal) => {
        const actual = await importOriginal()
        return {
          ...actual,
          useId: () => 'foo',
        }
      })

      const wrapper = useSetupWithPlugin(() => {
        useVRouter(routes)
      })

      const virou = wrapper.vm.$virou

      expect(virou.has('foo')).toBe(true)
    })

    it('should add route', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      const wrapper = useSetupWithPlugin(() => {
        const { router } = useVRouter('foo', routes)

        router.addRoute({ path: '/about', component: () => null })
      })

      const router = wrapper.vm.$virou.get('foo')

      expect(router?.routes.size).toBe(2)
    })

    it('should replace active path', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      const wrapper = useSetupWithPlugin(() => {
        const { router } = useVRouter('foo', routes)

        router.replace('/about')
      })

      const router = wrapper.vm.$virou.get('foo')

      expect(router?.activePath.value).toBe('/about')
    })

    it('should dispose a non-global router after have no dependency', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      const wrapper = useSetupWithPlugin(() => {
        useVRouter('temp', routes)
      })

      const virou = wrapper.vm.$virou
      expect(virou.has('temp')).toBe(true)

      wrapper.unmount()
      expect(virou.has('temp')).toBe(false)
    })

    it('should not dispose a global router after have no dependency', () => {
      const routes: VRouteRaw[] = [{ path: '/', component: () => null }]

      const wrapper = useSetupWithPlugin(() => {
        useVRouter('temp', routes, { isGlobal: true })
      })

      const virou = wrapper.vm.$virou
      expect(virou.has('temp')).toBe(true)

      wrapper.unmount()
      expect(virou.has('temp')).toBe(true)
    })

    it('should inject router key from parent component to child component router', () => {
      const routes: VRouteRaw[] = [{ path: '/shared', component: () => null }]

      let childRoute: VRoute = {} as VRoute
      let parentRoute: VRoute = {} as VRoute

      const Child = defineComponent({
        setup() {
          const { route } = useVRouter()
          childRoute = route.value
          return () => null
        },
      })

      const Parent = defineComponent({
        components: { Child },
        setup() {
          const { route } = useVRouter('shared', routes, { initialPath: '/shared' })
          parentRoute = route.value
          return () => h(Child)
        },
      })

      expect(() => mount(Parent, { global: { plugins: [virou] } })).not.toThrowError()
      expect(childRoute).toBe(parentRoute)
    })
  })
})
