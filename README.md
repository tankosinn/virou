# 🧭 Virou

<p>
  <a href="https://www.npmjs.com/package/@virou/core"><img src="https://img.shields.io/npm/v/@virou/core.svg?style=flat&colorA=18181B&colorB=39737d" alt="Version"></a>
  <a href="https://www.npmjs.com/package/@virou/core"><img src="https://img.shields.io/npm/dm/@virou/core.svg?style=flat&colorA=18181B&colorB=39737d" alt="Downloads"></a>
  <a href="https://bundlephobia.com/package/@virou/core"><img src="https://img.shields.io/bundlephobia/min/@virou/core?style=flat&colorA=18181B&colorB=39737d" alt="Bundle Size"><a/>
  <a href="https://github.com/tankosinn/virou/tree/main/LICENSE"><img src="https://img.shields.io/github/license/tankosinn/virou.svg?style=flat&colorA=18181B&colorB=39737d" alt="License"></a>
</p>

Virou is a high-performance, lightweight virtual router for Vue with dynamic routing capabilities.

> Perfect for modals, wizards, embeddable widgets, or any scenario requiring routing without altering the browser's URL or history.

## ✨ Features

- 🪄 **Dynamic Virtual Routing**: Navigate without altering the browser's URL or history
- 🍂 **Multiple Router Instances**: Manage independent routing contexts within the same app
- 🪆 **Nested Routing**: Seamlessly handle complex, nested routes
- 🦾 **Type-Safe**: Written in [TypeScript](https://www.typescriptlang.org/)
- ⚡ **SSR-Friendly**: Compatible with server-side rendering

## 🐣 Usage
```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

// Define your routes
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
]

// Create a virtual router instance
const { router, route } = useVRouter(routes)
</script>

<template>
  <!-- Renders the current route's component -->
  <VRouterView />
</template>
```

## 📦 Installation

Install Virou with your package manager:

```bash
pnpm add @virou/core
```

Register the `virou` plugin in your Vue app:

```typescript
import { virou } from '@virou/core'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .use(virou)
  .mount('#app')
```

> ⚠️ Virou doesn’t globally register any components (including `VRouterView`); it only adds a `$virou` global property to store router instances in a `Map<string, VRouterData>`, which are automatically removed when no longer in use.

### 🧩 Using with Nuxt

Install Virou Nuxt module with your package manager:

```bash
pnpm add @virou/nuxt
```

Add the module to your Nuxt configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@virou/nuxt',
  ],
})
```

## 🧱 Essentials

### 🌿 Routes

Declare your routes as an array of objects with required `path` and `component`, and optional `meta` and `children` properties.

```typescript
const routes: VRouterRaw[] = [
  {
    path: '/', // static path
    component: Home,
  },
  {
    path: '/user/:id', // dynamic path with parameter
    component: () => import('./views/User.vue'),
    meta: {
      foo: 'bar',
    }
  },
  {
    path: '/**:notFound', // Named wildcard path
    component: defineAsyncComponent(() => import('./views/NotFound.vue')),
  }
]
```

**Props**:
- `path`: the URL pattern to match. Supports:
  - Static ("/about") for exact matches
  - Dynamic ("/user/:id") for named parameters
  - Wildcard ("/**") for catch-all segments
  - Named wildcard ("/**:notFound") for catch-all with a name
- `component`: the Vue component to render when this route matches. Can be synchronous or an async loader.
- `meta`: metadata for the route.
- `children`: an array of child routes.

> Virou uses [rou3](https://github.com/h3js/rou3) under the hood for create router context and route matching.

### 🪆 Nested Routes

To define nested routes, add a children array to a route record. Child path values are relative to their parent (leading `/` is ignored).

```typescript
const routes: VRouterRaw[] = [
  // ...
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '', // /user/:id  -> default child route
        component: UserProfile,
      },
      {
        path: '/settings', // /user/:id/settings
        component: UserSettings,
        children: [
          {
            path: '/', // /user/:id/settings -> deep default child route
            component: UserSettingsGeneral,
          },
          {
            path: '/notifications', // /user/:id/settings/notifications
            component: UserSettingsNotifications,
          },
        ],
      },
    ]
  },
  // ...
]
```

### 🌳 Router

Create (or access) a virtual router instance with `useVRouter` composable.

```typescript
const { router, route } = useVRouter('my-wizard', routes)
```

> `useVRouter` must be called inside `setup()`.

**Params:**
- `key`: a unique key for the router instance. If you do not provide a key, Virou will generate one via `useId()`.
- `routes`: an array of route objects.
- `options`:
  - `initialPath`: the path to render on initialization (defaults to `/`).

**Returns:**
- `route`: a Vue shallow ref that contains the current route object.
  ```typescript
  export interface VRoute {
    fullPath: string
    path: string
    search: string
    hash: string
    meta?: Record<PropertyKey, unknown>
    params?: Record<string, string>
    _renderList: Component[] | null
  }
  ```
- `router`:
  - `replace(path: string): void`: navigate to a new path.
  - `addRoute(route: VRouteRaw): void`: add a route at runtime.

#### 🍃 Multiple Router Instances

Virou allows you to create multiple independent router instances within the same app.

```vue
<script setup lang="ts">
// Settings modal router
useVRouter('settings-modal', [
  {
    path: '/profile',
    component: UserProfile,
  },
  {
    path: '/preferences',
    component: UserPreferences,
  },
  // ...
], { initialPath: '/profile' })

// Onboarding wizard router
useVRouter('onboarding-wizard', [
  {
    path: '/profile',
    component: OnboardingProfile,
  },
  {
    path: '/teamspace',
    component: OnboardingTeamspace,
  },
  // ...
], { initialPath: '/profile' })
</script>

<template>
  <SettingsModal>
    <VRouterView router-key="settings-modal" />
  </SettingsModal>

  <Wizard>
    <VRouterView router-key="onboarding-wizard" />
  </Wizard>
</template>
```

## 📺 Rendering

`<VRouterView>` mounts the matched component at its current nesting depth.

```vue
<template>
  <VRouterView router-key="my-router">
    :keep-alive="true"     <!-- preserve component state -->
    :view-key="(route, key) => `${key}|${route.fullPath}`" <!-- custom vnode key -->
    >
    <!-- default slot receives { Component, route } -->
    <template #default="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" v-bind="route.params" />
      </Transition>
    </template>

    <!-- fallback slot shown while async loader resolves -->
    <template #fallback>
      <div class="spinner">
        Loading...
      </div>
    </template>
  </VRouterView>
</template>
```

**Props:**
- `routerKey`: key of the router instance to render. If not provided, uses the nearest router instance.
- `keepAlive`: wraps the rendered component in `<KeepAlive>` when set to true, preserving its state across navigations.
- `viewKey`: accepts either a string or a function `(route, key) => string` to compute the vnode key for the rendered component.

**Slots:**
- `default`: slot receives `{ Component, route }` so you can wrap or decorate the active component.
- `fallback`: receives `{ route }` and is displayed inside `<Suspense>` while an async component is resolving.

> Virou wraps components in `<Suspense>` by default. To combine `<Suspense>` with other components, see the [Vue docs](https://vuejs.org/guide/built-ins/suspense#combining-with-other-components).

## 🛠️ Advanced

### 🌐 Global Routers

By default, routers created with `useVRouter(key, routes)` are disposable—they unregister themselves automatically once no components reference them.

To keep a router alive for your app’s entire lifecycle, register it as a global router.

#### Plugin-Registered Globals

Defined routers in the `virou` plugin options are registered as global routers:

```ts
createApp(App)
  .use(virou, {
    routers: {
      'embedded-widget-app': {
        routes: [
          { path: '/chat', component: () => import('./views/Chat.vue') },
          { path: '/settings', component: () => import('./views/Settings.vue') },
        ],
        options: { initialPath: '/chat' }
      },
      // add more global routers here...
    }
  })
  .mount('#app')
```

Later:

```ts
const { router, route } = useVRouter('embedded-widget-app')
```

#### Runtime-Registered Globals

You may also mark a router as global at runtime by passing the `isGlobal` option:

```ts
useVRouter(routes, { isGlobal: true })
```

That router will stay registered even after components that use it unmount.

### 🧪 Create Standalone Virtual Router

You can create a standalone virtual router with `createVRouter`:

```ts
export function useCustomRouter() {
  const { router, route } = createVRouter(routes)

  // Custom logic here...
}
```

## 📝 License

[MIT License](https://github.com/tankosinn/virou/blob/main/LICENSE)
