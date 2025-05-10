import type { App } from 'vue'
import { virou, VRouterView } from '@virou/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'

describe('plugin', () => {
  let app: App

  beforeEach(() => {
    app = createApp({})
  })

  it('should install the plugin', () => {
    app.use(virou)

    const map = app.config.globalProperties.$virou
    expect(map).toBeDefined()
    expect(map).toBeInstanceOf(Map)
    expect(map.size).toBe(0)
  })

  it('should globally register the component', () => {
    app.use(virou)
    expect(app.component('VRouterView')).toBe(VRouterView)
  })

  it('should pre-register routers from options with _isGlobal=true', () => {
    const routes = [{ path: '/foo', component: { name: 'Foo', render: () => null } }]

    app.use(virou, {
      routers: {
        foo: {
          routes,
          options: {
            initialPath: '/foo',
          },
        },
      },
    })

    const map = app.config.globalProperties.$virou
    const router = map.get('foo')

    expect(router).toBeDefined()
    expect(router?._isGlobal).toBe(true)

    const paths = [...router!.routes.keys()].map(([path]) => path)
    expect(paths).toContain('/foo')
    expect(router?.activePath.value).toBe('/foo')
  })
})
