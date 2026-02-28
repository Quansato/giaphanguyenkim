<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { LogIn, Eye, EyeOff } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMsg.value = 'Vui lòng nhập email và mật khẩu.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch (e: any) {
    errorMsg.value = 'Email hoặc mật khẩu không đúng.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box card">
      <div class="login-header">
        <h1>Đăng nhập quản trị</h1>
        <p>Chỉ dành cho người quản lý gia phả</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="admin@example.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <div class="pass-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              class="form-control"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button type="button" class="pass-toggle" @click="showPass = !showPass">
              <component :is="showPass ? EyeOff : Eye" :size="16" />
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <LogIn :size="16" />
          {{ loading ? 'Đang đăng nhập…' : 'Đăng nhập' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-box {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.login-header p {
  color: var(--color-muted);
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

.pass-wrapper {
  position: relative;
}
.pass-wrapper .form-control {
  padding-right: 2.5rem;
}
.pass-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
}

.error-msg {
  color: #dc2626;
  font-size: 0.87rem;
  margin-bottom: 0.75rem;
}

.btn-block {
  width: 100%;
  justify-content: center;
}
</style>
