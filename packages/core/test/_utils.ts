import type { ComponentMountingOptions } from '@vue/test-utils'
import { virou } from '@virou/core'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

export function useSetup<V, C>(setup: () => V, options?: ComponentMountingOptions<C>) {
  const Comp = defineComponent({
    setup,
    render: () => null,
  })

  return mount(Comp, options)
}

export function useSetupWithPlugin<V, C>(
  setup: () => V,
  options?: ComponentMountingOptions<C>,
) {
  return useSetup<V, C>(
    setup,
    {
      ...options,
      global: {
        ...options?.global,
        plugins: [
          ...(options?.global?.plugins ?? []),
          virou,
        ],
      },
    },
  )
}

export function mountWithPlugin<C>(
  component: C,
  options?: ComponentMountingOptions<C>,
) {
  return mount(component, {
    ...options,
    global: {
      ...options?.global,
      plugins: [
        ...(options?.global?.plugins ?? []),
        virou,
      ],
    },
  })
}
