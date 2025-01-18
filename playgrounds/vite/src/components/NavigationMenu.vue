<script setup lang="ts">
import { useVRouter } from '@virou/core'

defineProps<{
  links: {
    label: string
    to: string
  }[]
}>()

const { route, router } = useVRouter()
</script>

<template>
  <div class="navigation-menu">
    <ul>
      <li v-for="link in links" :key="link.to">
        <button :class="{ active: route.path === link.to }" @click="() => router.replace(link.to)">
          {{ link.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.navigation-menu {
  width: 250px;
  background-color: #f2f2f2;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
}

.navigation-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.navigation-menu li {
  margin: 0;
  padding: 0;
}

.navigation-menu button {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  color: #333;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all ease-in-out 0.2s;
  width: 100%;
  text-align: left;
}

.navigation-menu button:hover {
  background-color: #dbdbdb;
}

.navigation-menu button.active {
  color: #f2f2f2;
  font-weight: bold;
  background-color: #333;
}

.navigation-menu button.active:hover {
  background-color: #20201e;
}
</style>
