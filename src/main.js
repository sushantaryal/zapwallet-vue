import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { configureEcho } from '@laravel/echo-vue'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

import './app.css'
import App from './App.vue'
import router from './router'

configureEcho({
    broadcaster: 'pusher',
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios
                    .post('/api/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => {
                        callback(false, response.data)
                    })
                    .catch((error) => {
                        callback(true, error)
                    })
            },
        }
    },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
