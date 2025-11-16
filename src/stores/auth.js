import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: {},
        authenticated: false,
        loading: false,
    }),

    actions: {
        async login(credentials) {
            this.loading = true
            await axios.get('/sanctum/csrf-cookie')

            try {
                await axios.post('/login', credentials)
                attempt()
            } catch (e) {
                throw e
            } finally {
                this.loading = false
            }
        },

        async attempt() {
            try {
                let response = await axios.get('/api/user')

                this.authenticated = true
                this.user = response.data.user
            } catch (e) {
                this.authenticated = false
                this.user = {}
            }
        },

        async logout() {
            await axios.post('/logout')
            this.authenticated = false
            this.user = {}
        },
    },
})
