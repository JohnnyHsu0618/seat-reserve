<script setup lang="ts">
import { useTheme } from './composables/useTheme'

// Initialize theme
const { initTheme } = useTheme()
initTheme()
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style scoped>
/* App styles */
</style>
