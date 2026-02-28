import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/libs/supabase'
import type { Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const session = ref<Session | null>(null)

    const isLoggedIn = computed(() => !!session.value)

    async function initAuth() {
        // Lấy session hiện tại
        const { data } = await supabase.auth.getSession()
        session.value = data.session

        // Lắng nghe thay đổi auth state
        supabase.auth.onAuthStateChange((_event: string, newSession: typeof session.value) => {
            session.value = newSession
        })
    }

    async function login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        session.value = data.session
    }

    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        session.value = null
    }

    return { session, isLoggedIn, initAuth, login, logout }
})
