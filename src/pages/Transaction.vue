<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { useAuth } from '@/composables/useAuth'
import Navigation from '@/components/Navigation.vue'

const { user } = useAuth()

const balance = ref(0.0)
const transactions = ref([])
const errors = ref({})
const message = ref('')
const processing = ref(false)
const loadingMore = ref(false)

const fetchTransactions = async () => {
    const response = await axios.get('/api/transactions')
    balance.value = response.data.balance
    transactions.value = response.data.transactions
}

onMounted(async () => {
    await fetchTransactions()
})

// load more
async function loadMore() {
    if (!transactions.value.next_page_url) return
    loadingMore.value = true
    try {
        const { data } = await axios.get(transactions.value.next_page_url)
        // append results
        transactions.value.data = transactions.value.data.concat(data.data || data.transactions.data)
        transactions.value.next_page_url = data.transactions.next_page_url ?? null
    } finally {
        loadingMore.value = false
    }
}

const formatMoney = (v) => {
    return Number(v).toFixed(2)
}
const formattedBalance = computed(() => formatMoney(balance.value))

const form = reactive({
    receiver_id: '',
    amount: 0,
})

const transfer = async () => {
    errors.value = {}
    processing.value = true
    try {
        await axios.post('/api/transactions', form)
        processing.value = false
    } catch (e) {
        errors.value = e?.response?.data?.errors
    }
}
</script>

<template>
    <Navigation />
    <div class="max-w-7xl mx-auto mt-8">
        <div class="max-w-2xl mx-auto">
            <h2>Current Balance: {{ formattedBalance }}</h2>

            <form class="space-y-6 mt-4" @submit.prevent="transfer">
                <div>
                    <label for="recipient" class="block text-sm/6 font-medium text-gray-900">Recipient's ID</label>
                    <div class="mt-2">
                        <input type="number" v-model.number="form.receiver_id" id="recipient" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                    </div>
                    <p v-if="errors?.receiver_id" class="mt-1 text-sm text-red-400">
                        {{ errors?.receiver_id[0] }}
                    </p>
                </div>
                <div>
                    <label for="amount" class="block text-sm/6 font-medium text-gray-900">Amount</label>
                    <div class="mt-2">
                        <input type="number" v-model.number="form.amount" id="amount" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                    </div>
                    <p v-if="errors?.amount" class="mt-1 text-sm text-red-400">
                        {{ errors?.amount[0] }}
                    </p>
                </div>

                <div>
                    <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400" :disabled="processing">Transfer</button>
                </div>
            </form>
        </div>
        <div class="relative overflow-x-auto mt-8">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3">Sender</th>
                        <th scope="col" class="px-6 py-3">Receiver</th>
                        <th scope="col" class="px-6 py-3">Amount</th>
                        <th scope="col" class="px-6 py-3">Commission</th>
                        <th scope="col" class="px-6 py-3">Created Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-200" :class="[transaction.sender_id == user.id ? 'bg-green-100' : 'bg-red-100']" v-for="transaction in transactions?.data">
                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ transaction.sender.name }}</th>
                        <td class="px-6 py-4">{{ transaction.receiver.name }}</td>
                        <td class="px-6 py-4">{{ formatMoney(transaction.amount) }}</td>
                        <td class="px-6 py-4">{{ formatMoney(transaction.commission_fee) }}</td>
                        <td class="px-6 py-4">{{ transaction.created_at }}</td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="text-white bg-blue-700 mt-4 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" v-if="transactions.next_page_url && !loadingMore" @click="loadMore">Load more</button>
        </div>
    </div>
</template>
