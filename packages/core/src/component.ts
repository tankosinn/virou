import { computed, defineComponent, h, inject, KeepAlive, provide } from 'vue'
import { useVRouter, virouSymbol } from './router'

export const VRouterView = defineComponent({
  name: 'VRouterView',
  props: {
    routerKey: {
      type: String,
      default: undefined,
    },
    viewKey: {
      type: String,
      default: undefined,
    },
    keepalive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const routerKey = props.routerKey ?? inject<string>(virouSymbol)

    if (routerKey === undefined) {
      throw new Error(`[virou] [VRouterView] routerKey is required`)
    }

    const { router, route } = useVRouter(routerKey)
    const depth = inject(router._depthKey, 0)
    const render = computed(() => route.value.renderList?.[depth])

    provide(router._depthKey, depth + 1)

    return () => {
      const [key, component] = render.value ?? []

      const _key = key ?? props.viewKey ?? route.value.path
      const ViewComponent = component !== null && component !== undefined ? h(component, { _key }) : null
      return props.keepalive ? h(KeepAlive, null, [ViewComponent]) : ViewComponent
    }
  },
})
