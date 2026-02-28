<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useMemberStore } from './stores/memberStore'
import Navbar from './components/Navbar.vue'

const memberStore = useMemberStore()
onMounted(() => memberStore.fetchAll())
</script>

<template>
  <div id="app-wrapper">
    <Navbar />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
</style>
