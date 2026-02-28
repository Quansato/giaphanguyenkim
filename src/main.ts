import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routers'
import { useAuthStore } from './stores/authStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Khởi tạo auth trước khi mount
const authStore = useAuthStore()
authStore.initAuth().then(() => {
    app.mount('#app')
})
