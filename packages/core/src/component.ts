import type { PropType, SlotsType, VNodeChild } from 'vue'
import type { VRoute } from './types'
import {
  defineComponent,
  h,
  inject,
  KeepAlive,
  provide,
  Suspense,
} from 'vue'
import { useVRouter, virouSymbol } from './router'

export const VRouterView = defineComponent({
  name: 'VRouterView',
  inheritAttrs: false,
  props: {
    routerKey: String,
    keepAlive: { type: Boolean, default: false },
    viewKey: { type: [String, Function] as PropType<string | ((route: VRoute, key: string) => string)> },
  },
  slots: Object as SlotsType<{
    default: (payload: { Component: VNodeChild, route: VRoute }) => VNodeChild
    fallback: (payload: { route: VRoute }) => VNodeChild
  }>,
  setup(props, { slots, attrs }) {
    const key = props.routerKey ?? inject<string>(virouSymbol)
    if (key === undefined) {
      throw new Error('[virou] [VRouterView] routerKey is required')
    }

    const { route, router } = useVRouter(key)

    const depth = inject<number>(router._depthKey, 0)
    provide(router._depthKey, depth + 1)

    return () => {
      const component = route.value._renderList?.[depth]
      if (!component) {
        return slots.default?.({ Component: null, route: route.value }) ?? null
      }

      const vnodeKey = typeof props.viewKey === 'function'
        ? props.viewKey(route.value, key)
        : props.viewKey ?? `${key}-${depth}-${route.value.path}`

      const suspenseVNode = h(
        Suspense,
        null,
        {
          default: () => h(component, { key: vnodeKey, ...attrs }),
          fallback: () => slots.fallback?.({ route: route.value }) ?? null,
        },
      )

      const vnode = props.keepAlive
        ? h(KeepAlive, null, { default: () => suspenseVNode })
        : suspenseVNode

      return slots.default?.({ Component: vnode, route: route.value }) ?? vnode
    }
  },
})
