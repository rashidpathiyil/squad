<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
    <div class="w-full max-w-md relative">
      <!-- Decorative elements -->
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"/>
      <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"/>
      
      <!-- Card -->
      <div class="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-flex items-center space-x-2 mb-8">
            <Icon name="carbon:api" class="w-8 h-8 text-blue-400" />
            <span class="text-xl font-bold">CEA</span>
          </NuxtLink>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Create your account
          </h1>
          <p class="text-gray-400 mt-2">Start enriching your leads with AI-powered insights</p>
        </div>

        <form class="space-y-4" @submit.prevent="register">
          <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {{ error }}
          </div>

          <div v-if="success" class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {{ success }}
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="john@example.com"
              class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            >
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              required
            >
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
          >
            <span v-if="!loading">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </span>
          </button>

          <div class="mt-6 text-center text-gray-400">
            Already have an account?
            <NuxtLink to="/auth/login" class="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false,
  auth: false
})

const { register: registerUser } = useAuth()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const register = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''

  // Validation
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    loading.value = false
    return
  }

  try {
    await registerUser({
      name: form.name,
      email: form.email,
      password: form.password
    })
    
    success.value = 'Account created successfully! Please log in.'
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
    
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script> 
