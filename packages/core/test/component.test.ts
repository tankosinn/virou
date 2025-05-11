import type { VRoute, VRouter, VRouteRaw } from '@virou/core'
import type { VNodeChild } from 'vue'
import { useVRouter, virou, VRouterView } from '@virou/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineAsyncComponent, defineComponent, h, KeepAlive, nextTick, onMounted, ref } from 'vue'
import { mountWithPlugin } from './_utils'

describe('component', () => {
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('throws if neither a `routerKey` prop nor injected key is provided', () => {
    expect(() => mountWithPlugin(VRouterView))
      .toThrowError('[virou] [VRouterView] routerKey is required')
  })

  it('should use the injected key if no `routerKey` prop is provided', () => {
    const routes: VRouteRaw[] = [{ path: '/', component: defineComponent({ name: 'Injected', render: () => null }) }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter('injected', routes)
        return () => h(VRouterView)
      },
    }))

    expect(wrapper.findComponent({ name: 'Injected' }).exists()).toBe(true)
  })

  it('should prop `routerKey` takes precedence over injected key', () => {
    const injectedRoutes: VRouteRaw[] = [{ path: '/', component: defineComponent({ name: 'Injected', render: () => null }) }]
    const explicitRoutes: VRouteRaw[] = [{ path: '/', component: defineComponent({ name: 'Explicit', render: () => null }) }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter('explicit', explicitRoutes)
        useVRouter('injected', injectedRoutes)
        return () => h('div', [
          h(VRouterView),
          h(VRouterView, { routerKey: 'explicit' }),
        ])
      },
    }))

    expect(wrapper.findComponent({ name: 'Injected' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Explicit' }).exists()).toBe(true)
  })

  it('should render correct component at depth 0', () => {
    const routes: VRouteRaw[] = [{ path: '/', component: defineComponent({ name: 'Root', render: () => null }) }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter(routes)
        return () => h(VRouterView)
      },
    }))

    expect(wrapper.findComponent({ name: 'Root' }).exists()).toBe(true)
  })

  it('should renders parent and nested child components', () => {
    const routes: VRouteRaw[] = [
      {
        path: '/',
        component: defineComponent({ name: 'Parent', render: () => h('div', [h(VRouterView)]) }),
        children: [
          {
            path: 'child',
            component: defineComponent({ name: 'Child', render: () => null }),
          },
        ],
      },
    ]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter(routes, { initialPath: '/child' })
        return () => h(VRouterView)
      },
    }))

    expect(wrapper.findComponent({ name: 'Parent' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Child' }).exists()).toBe(true)
  })

  it('should render correct render list on route change', async () => {
    const routes: VRouteRaw[] = [
      {
        path: '/foo',
        component: defineComponent({ name: 'Foo', render: () => null }),
      },
      {
        path: '/bar',
        component: defineComponent({ name: 'Bar', render: () => [h(VRouterView)] }),
        children: [
          {
            path: '',
            component: defineComponent({ name: 'Baz', render: () => null }),
          },
          {
            path: 'qux',
            component: defineComponent({ name: 'Qux', render: () => null }),
          },
        ],
      },
    ]

    let router!: VRouter['router']

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        const { router: _router } = useVRouter(routes, { initialPath: '/foo' })
        router = _router
        return () => h(VRouterView)
      },
    }))

    expect(wrapper.findComponent({ name: 'Foo' }).exists()).toBe(true)

    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'Baz' }).exists()).toBe(false)

    router.replace('/bar')

    await nextTick()

    expect(wrapper.findComponent({ name: 'Foo' }).exists()).toBe(false)

    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Baz' }).exists()).toBe(true)

    router.replace('/bar/qux')

    await nextTick()

    expect(wrapper.findComponent({ name: 'Foo' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'Bar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'Baz' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'Qux' }).exists()).toBe(true)
  })

  it('should generate default viewKey when no `viewKey` prop is provided', () => {
    const Root = defineComponent({
      name: 'Root',
      setup: () => () => h('div', 'root'),
    })

    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter('abc', routes)
        return () => h(VRouterView)
      },
    }))

    const rootWrapper = wrapper.findComponent(Root)
    expect(rootWrapper.exists()).toBe(true)
    expect(rootWrapper.vm.$.vnode.key).toBe('abc-0-/')
  })

  it('should use the string `viewKey` prop as the vnode key', () => {
    const Root = defineComponent({
      name: 'Root',
      setup: () => () => h('div', 'root'),
    })
    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter('abc', routes)
        return () => h(VRouterView, { viewKey: 'my-key' })
      },
    }))

    const rootWrapper = wrapper.findComponent(Root)
    expect(rootWrapper.exists()).toBe(true)
    expect(rootWrapper.vm.$.vnode.key).toBe('my-key')
  })

  it('should use the function `viewKey` prop to compute the vnode key', () => {
    const Root = defineComponent({
      name: 'Root',
      setup: () => () => h('div', 'root'),
    })
    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter('abc', routes)
        return () => h(VRouterView, {
          routerKey: 'abc',
          viewKey: (route, key) => `${key}|${route.path}|depth${route._renderList!.length}`,
        })
      },
    }))

    const rootWrapper = wrapper.findComponent(Root)
    expect(rootWrapper.exists()).toBe(true)
    expect(rootWrapper.vm.$.vnode.key).toBe('abc|/|depth1')
  })

  it('should warp the component with KeepAlive when `keepAlive` prop is true', () => {
    const Root = defineComponent({
      name: 'Root',
      setup: () => null,
    })

    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter(routes)
        return () => h(VRouterView, { keepAlive: true })
      },
    }))

    const ka = wrapper.findComponent(KeepAlive)
    expect(ka.exists()).toBe(true)
    expect(ka.findComponent(Root).exists()).toBe(true)
  })

  it('should render the fallback slot while an async component is loading', async () => {
    vi.useFakeTimers()

    const timeOut = 1000

    const Comp = defineComponent({
      name: 'AsyncComp',
      setup() {
        return () => h('div', 'I loaded after 1 second!')
      },
    })

    const AsyncComp = defineAsyncComponent<typeof Comp>(async () =>
      new Promise<typeof Comp>((resolve) => {
        setTimeout(() => {
          resolve(Comp)
        }, timeOut)
      }),
    )

    const routes: VRouteRaw[] = [{ path: '/', component: AsyncComp }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter(routes)
        return () => h(VRouterView, null, { fallback: () => h('div', 'Loading...') })
      },
    }))

    expect(wrapper.text()).toBe('Loading...')

    await vi.advanceTimersByTimeAsync(timeOut)
    await nextTick()

    expect(wrapper.text()).toBe('I loaded after 1 second!')
  })

  it('should expose the routed component and route object via the default slot', async () => {
    const Root = defineComponent({
      name: 'Root',
      render: () => h('div', 'root content'),
    })

    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        useVRouter(routes)
        return () =>
          h(VRouterView, null, {
            default: ({ Component, route }: { Component: VNodeChild, route: VRoute }) =>
              h('div', [
                Component,
                h('span', `path: ${route.path}`),
              ]),
          })
      },
    }))

    expect(wrapper.findComponent(Root).exists()).toBe(true)
    expect(wrapper.text()).toContain('root content')
    expect(wrapper.text()).toContain('path: /')
  })

  it('should forward arbitrary attrs and props to the rendered component', () => {
    const Root = defineComponent({
      name: 'Root',
      props: { foo: String },
      setup(props) {
        return () => h('div', { 'data-foo': props.foo }, `foo is ${props.foo}`)
      },
    })

    const routes: VRouteRaw[] = [{ path: '/', component: Root }]

    const wrapper = mountWithPlugin(
      defineComponent({
        setup() {
          useVRouter(routes)
          return () =>
            h(VRouterView, {
              'foo': 'hello-world',
              'data-test': 'wrapped',
            })
        },
      }),
      { global: { plugins: [virou] } },
    )

    const root = wrapper.findComponent(Root)
    expect(root.exists()).toBe(true)
    expect(root.props('foo')).toBe('hello-world')
    expect(root.attributes('data-test')).toBe('wrapped')
    expect(root.text()).toBe('foo is hello-world')
  })

  it('should preserve component instance state when `keepAlive` is true across route changes', async () => {
    const Counter = defineComponent({
      name: 'Counter',
      setup() {
        const count = ref(0)
        onMounted(() => {
          count.value++
        })
        return () => h('div', `count: ${count.value}`)
      },
    })
    const routes: VRouteRaw[] = [
      { path: '/', component: Counter },
      { path: '/other', component: { name: 'Other', render: () => null } },
    ]

    let router!: VRouter['router']

    const wrapper = mountWithPlugin(defineComponent({
      setup() {
        const { router: r } = useVRouter(routes)
        router = r
        return () => h(VRouterView, { keepAlive: true })
      },
    }))

    await nextTick()
    expect(wrapper.text()).toBe('count: 1')

    router.replace('/other')
    await nextTick()
    expect(wrapper.text()).toBe('')

    router.replace('/')
    await nextTick()
    expect(wrapper.text()).toBe('count: 1')
  })

  it('should render the default slot when there is no matched component', () => {
    const routes: VRouteRaw[] = [
      {
        path: '/',
        component: defineComponent({
          name: 'Root',
          render: () => h('div', 'root'),
        }),
      },
    ]

    const wrapper = mountWithPlugin(
      defineComponent({
        setup() {
          useVRouter(routes, { initialPath: '/not-exist' })
          return () =>
            h(VRouterView, undefined, {
              default: ({ Component, route }: { Component: VNodeChild, route: VRoute }) => Component ?? h('span', `no match for ${route.fullPath}`),
            })
        },
      }),
      { global: { plugins: [virou] } },
    )

    expect(wrapper.find('span').text()).toBe('no match for /not-exist')
  })
})
