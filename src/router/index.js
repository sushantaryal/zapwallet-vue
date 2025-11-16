import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/pages/Login.vue'
import DashboardView from '@/pages/Dashboard.vue'
import TransactionView from '@/pages/Transaction.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: LoginView,
            meta: {
                guest: true,
            },
        },
        {
            path: '/transactions',
            component: TransactionView,
            meta: {
                requiresAuth: true,
            },
        },
    ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (!auth.authenticated) {
        await auth.attempt()
    }
    if (to.meta.requiresAuth && !auth.authenticated) {
        return { path: '/' }
    }
    if (to.meta.guest && auth.authenticated) {
        return { path: '/transactions' }
    }
})

export default router
