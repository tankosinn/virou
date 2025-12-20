import type { Component } from 'vue'
import type { VRouteLazyComponent, VRouteRenderComponent } from './types'
import { defineAsyncComponent } from 'vue'

export function normalizeComponent(component: VRouteRenderComponent): Component {
  if (typeof component === 'function' && (component as VRouteLazyComponent).length === 0) {
    return defineAsyncComponent(component as VRouteLazyComponent)
  }
  return component as Component
}
