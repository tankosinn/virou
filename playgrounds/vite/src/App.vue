<script setup lang="ts">
import { useVRouter, VRouterView } from '@virou/core'
import { computed } from 'vue'
import { VueShikiInput } from 'vue-shiki-input'
import NavigationMenu from './components/NavigationMenu.vue'
import 'vue-shiki-input/style.css'

const routes = [
  {
    path: '/',
    component: () => import('./components/RouteInfo.vue'),
    meta: {
      title: 'Home',
      description: 'Home page',
    },
  },
  {
    path: '/about',
    component: () => import('./components/RouteInfo.vue'),
    meta: {
      title: 'About',
      description: 'About page',
    },
  },
  {
    path: '/blog',
    component: () => import('./components/RouteInfo.vue'),
    meta: {
      title: 'Blog',
      description: 'Blog page',
    },
    children: [
      {
        path: '',
        component: () => import('./components/RouteInfo.vue'),
      },
      {
        path: ':slug',
        component: () => import('./components/RouteInfo.vue'),
        meta: {
          title: 'Blog Post',
          description: 'Blog post page',
        },
        children: [
          {
            path: '',
            component: () => import('./components/RouteInfo.vue'),
          },
          {
            path: 'gallery',
            component: () => import('./components/RouteInfo.vue'),
            meta: {
              title: 'Blog Post Gallery',
              description: 'Blog post gallery page',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/blog/authors',
    component: () => import('./components/RouteInfo.vue'),
    meta: {
      title: 'Blog Authors',
      description: 'Blog authors page',
    },
  },
  {
    path: '/**',
    component: () => import('./components/RouteInfo.vue'),
    meta: {
      title: 'Not Found',
      description: 'Not found page',
    },
  },
]

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Blog Post 1', to: '/blog/post-1' },
  { label: 'Blog Post Gallery 1', to: '/blog/post-1/gallery' },
  { label: 'Blog Post 2', to: '/blog/post-2' },
  { label: 'Blog Post Gallery 2', to: '/blog/post-2/gallery' },
  { label: 'Blog Authors', to: '/blog/authors' },
]

const { route, router } = useVRouter(routes)

const code = computed(() => JSON.stringify(route.value, null, 2))
</script>

<template>
  <div class="container">
    <input type="text" :value="route.fullPath" @keyup="(e) => router.replace((e.target as HTMLInputElement).value)">
    <div class="content">
      <NavigationMenu :links="links" />
      <VueShikiInput
        v-model="code"
        class="shiki-container"
        :langs="['json']" :themes="['vitesse-black']"
        :code-to-html-options="{
          lang: 'json',
          theme: 'vitesse-black',
        }"
        :offset="{ x: 10, y: 10 }"
        line-numbers
        auto-background
        disabled
        :styles="{ codeClass: 'test', textareaClass: 'test' }"
      >
        <template #footer>
          <div class="shiki-footer">
            🧭 Virtual router with multiple instance support for Vue
          </div>
        </template>
      </VueShikiInput>
    </div>
    <VRouterView />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  width: 100%;
}

.content {
  display: flex;
  gap: 1rem;
  height: 100%;
  width: 100%;;
}

.shiki-container {
  width: 100%;
  height: 500px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: auto;
}

.shiki-footer {
  height: 30px;
  font-size: 12px;
  color: #fff5e5e6;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
  background-color: #121212;
  border-top: 1px solid #37383b;
}
</style>

<style>
* {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.shiki {
  overflow: scroll;
  height: 100%;
}
</style>
