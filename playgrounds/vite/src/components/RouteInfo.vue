<script setup lang="ts">
import { useVRouter, VRouterView } from '@virou/core'
import { computed, inject } from 'vue'

const { router, route } = useVRouter()

const currentDepth = inject(router._depthKey, 1) - 1

const routerDepth = computed(() => (route.value.renderList?.length ?? 0) - 1)
</script>

<template>
  <div class="route-info">
    <div v-if="currentDepth === routerDepth && route.data?.meta">
      <h2>{{ route.data.meta.title }}</h2>
      <p>{{ route.data.meta.description }}</p>
      <hr>
    </div>

    <p>Path: {{ route.renderList?.[currentDepth]?.[0] }}</p>
    <p>Depth: {{ currentDepth }}</p>

    <VRouterView />
  </div>
</template>

<style scoped>
.route-info {
  display: flex;
  flex-direction: column;
  background-color: rgba(12, 12, 12, 0.2);
  border-radius: 8px;
  padding: 1rem 2rem;
}
</style>
