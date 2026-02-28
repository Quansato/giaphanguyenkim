import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
        },
        {
            path: '/member/:id',
            name: 'member-detail',
            component: () => import('@/views/MemberDetailView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: { guestOnly: true },
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/AdminView.vue'),
            meta: { requiresAuth: true },
        },
    ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // Nếu route cần auth mà chưa login → redirect login
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Nếu đã login mà vào trang login → redirect home
    if (to.meta.guestOnly && auth.isLoggedIn) {
        return { name: 'home' }
    }
})

export default router
