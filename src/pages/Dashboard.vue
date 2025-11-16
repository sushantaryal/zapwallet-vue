<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { logout } = useAuth()

const logoutUser = async () => {
    try {
        await logout()
        router.push('/')
    } catch (e) {}
}
</script>

<template>
    <div>Dashboard</div>
    <button @click.prevent="logoutUser">Logout</button>
</template>
