import type { VRouterData } from '../types'

declare module 'vue' {
  interface ComponentCustomProperties {
    $virou: Map<string, VRouterData>
  }
}
