import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
    const store = useAuthStore()

    const user = computed(() => store.user)
    const isAuthenticated = computed(() => store.authenticated)

    return {
        user,
        isAuthenticated,
        login: store.login,
        logout: store.logout,
        initialize: store.attempt,
        loading: computed(() => store.loading),
    }
}
