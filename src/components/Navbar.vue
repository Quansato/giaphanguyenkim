<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { RouterLink, useRouter } from 'vue-router'
import { LogIn, LogOut, ShieldCheck, TreePine } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="navbar-brand">
        <TreePine :size="22" />
        <span>Gia Phả Nguyễn Kim</span>
      </RouterLink>

      <nav class="navbar-actions">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/admin" class="btn btn-ghost">
            <ShieldCheck :size="16" />
            Quản lý
          </RouterLink>
          <button class="btn btn-danger" @click="handleLogout">
            <LogOut :size="16" />
            Đăng xuất
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-primary">
            <LogIn :size="16" />
            Đăng nhập
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 248, 240, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
