# 🧭 Virou

<p>
  <a href="https://www.npmjs.com/package/@virou/core"><img src="https://img.shields.io/npm/v/@virou/core.svg?style=flat&colorA=18181B&colorB=39737d" alt="Version"></a>
  <a href="https://www.npmjs.com/package/@virou/core"><img src="https://img.shields.io/npm/dm/@virou/core.svg?style=flat&colorA=18181B&colorB=39737d" alt="Downloads"></a>
  <a href="https://github.com/tankosinn/virou/tree/main/LICENSE"><img src="https://img.shields.io/github/license/tankosinn/virou.svg?style=flat&colorA=18181B&colorB=39737d" alt="License"></a>
</p>

**Virou** is a virtual router for Vue applications, providing dynamic routing capabilities without modifying the browser's URL or history. It's ideal for use cases like modals, wizards, and complex in-app navigation.

## ✨ Features

- 🪄 **Dynamic Virtual Routing**: Navigate without altering the browser's URL or history
- 🍂 **Multiple Router Instances**: Manage independent routing contexts within the same app
- 🪆 **Nested Routing**: Seamlessly manage complex nested route structures
- 🦾 **Type-Safe**: Written in [TypeScript](https://www.typescriptlang.org/)
- ⚡ **SSR-Friendly**: Compatible with server-side rendering

## 🔮 Usage

### 🐣 Basic Setup

To get started, simply create your virtual router using `useVRouter` and define your routes.

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

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

const { router, route } = useVRouter(routes)
</script>

<template>
  <VRouterView keepalive />
</template>
```

- The `VRouterView` component renders the view tree of the current route.

### 💫 Full-Featured Route Tree

Virou enables you to define and manage complex route structures with ease. You can create hierarchical routes, use dynamic segments, and add metadata for each route.

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
    meta: {
      x: 1,
      y: 'hello'
    }
  },
  {
    key: 'example',
    path: '/blog',
    component: () => import('./views/Blog.vue'),
    children: [
      {
        path: '/:slug',
        component: () => import('./views/BlogPostLayout.vue'),
        children: [
          {
            path: '',
            component: () => import('./views/BlogPost.vue'),
          },
          {
            path: 'gallery',
            component: () => import('./views/BlogPostGallery.vue'),
          }
        ]
      },
      {
        path: 'authors',
        component: () => import('./views/BlogAuthors.vue'),
      }
    ]
  },
  {
    path: '/**',
    component: () => import('./views/NotFound.vue'),
  }
]

const { router, route } = useVRouter(routes)
</script>

<template>
  <VRouterView keepalive />
</template>
```

- You can use metadata (`meta`) for additional route data.

### 🌟 Multiple Router Instances

Virou allows you to have multiple independent virtual routers within the same app. You can assign unique keys to each router instance.

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

// Without key
const { router, route } = useVRouter(routes)

// With unique keys
const { router: router1, route: route1 } = useVRouter('router1', routes1)
const { router: router2, route: route2 } = useVRouter('router2', routes2)
</script>

<template>
  <VRouterView :router-key="router._key" keepalive />
  <VRouterView router-key="router1" />
  <VRouterView router-key="router2" keepalive />
</template>
```

- If a key is not provided, Virou automatically generates a unique key when you call `useVRouter` to create a new router instance.
- Each `VRouterView` component accepts a `routerKey` prop to specify which router instance to use.

### 🌿 Parent-Child Router Relationships

You can also use routers, with parent-child relationships between components.

#### Parent Component

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

const { router, route } = useVRouter('parent-router', parentRoutes)
</script>

<template>
  <VRouterView keepalive />
</template>
```

- You don't need to specify the `routerKey` for `VRouterView` if you're using `useVRouter` in the same component to create a new router.

#### Child Component

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

// Automatically uses the parent's router instance
const { router, route } = useVRouter()
</script>
```

- In the child component, you don’t need to explicitly provide the parent’s router key; Virou automatically inherits it from the parent.

### 🛠️ Adding Routes Dynamically

Virou supports adding new routes after the initial setup, giving you full flexibility.

```vue
<script setup lang="ts">
import { useVRouter } from '@virou/core'

const { router } = useVRouter()

// Add a new route dynamically
router.addRoute({
  path: '/new-route',
  component: () => import('./views/NewRoute.vue'),
})
</script>
```

- The `addRoute` method lets you to dynamically add new routes to your virtual router.

## 📦 Installation

Install Virou with your package manager:

```bash
pnpm add @virou/core
```

### 🧩 Using with Nuxt

To use Virou as a Nuxt module:

1. Install the Nuxt module:

```bash
pnpm add @virou/nuxt
```

2. Add the module to your Nuxt configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@virou/nuxt',
  ],
})
```

## 📝 License

[MIT License](https://github.com/tankosinn/virou/blob/main/LICENSE)
