<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Icon name="carbon:api" class="w-8 h-8 text-blue-400" />
          <span class="text-xl font-bold">CEA</span>
        </div>
        <div class="flex items-center space-x-6">
          <NuxtLink to="/docs" class="text-gray-300 hover:text-white transition-colors">Documentation</NuxtLink>
          <NuxtLink to="/auth/register" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Get Started</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="container mx-auto px-4 pt-32 pb-20">
      <div class="text-center mb-16 space-y-6">
        <h1 class="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
          Transform Your Leads into<br>Actionable Intelligence
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock the power of AI-driven user enrichment. Get comprehensive insights about your users in milliseconds.
        </p>
        <div class="flex items-center justify-center space-x-4 pt-4">
          <NuxtLink to="/auth/register" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
            Get Started
          </NuxtLink>
          <NuxtLink to="/docs" class="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all duration-200">
            View Documentation
          </NuxtLink>
        </div>
      </div>

      <!-- Interactive Demo Section -->
      <div class="max-w-4xl mx-auto relative">
        <!-- Decorative elements -->
        <div class="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl"/>
        <div class="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl"/>
        
        <div class="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            Live Demo
          </div>
          
          <form class="space-y-6" @submit.prevent="enrichUser">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  v-model="userData.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                >
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Email Address</label>
                <input
                  v-model="userData.email"
                  type="email"
                  placeholder="john@example.com"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                >
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Company</label>
                <input
                  v-model="userData.company"
                  type="text"
                  placeholder="Acme Inc"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Job Title</label>
                <input
                  v-model="userData.jobTitle"
                  type="text"
                  placeholder="Software Engineer"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              <span v-if="!loading">Enrich Data</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            </button>
          </form>

          <!-- Results Section -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <div v-if="enrichedData" class="mt-8">
              <h3 class="text-xl font-semibold text-blue-400 mb-4">Enriched Data Results</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
v-for="(value, key) in enrichedData" :key="key" 
                  class="bg-gray-700/30 p-4 rounded-xl hover:bg-gray-700/40 transition-colors">
                  <div class="text-sm text-gray-400 mb-1">{{ formatKey(key) }}</div>
                  <div class="text-white">{{ formatValue(value) }}</div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mt-32 grid md:grid-cols-3 gap-8">
        <div
          v-for="feature in features" 
          :key="feature.title" 
          class="group p-6 bg-gray-800/30 rounded-xl border border-gray-700 transform hover:scale-105 transition-all duration-300"
        >
          <div class="text-blue-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon :name="feature.icon" />
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
          <p class="text-gray-400">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-32 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-16">Trusted by Industry Leaders</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.value" class="p-6 bg-gray-800/30 rounded-xl">
            <div class="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{{ stat.value }}</div>
            <div class="text-gray-400">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-32 text-center">
        <div class="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p class="text-xl text-gray-200 mb-8">Transform your user data into actionable insights today.</p>
          <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <NuxtLink to="/auth/register" class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </NuxtLink>
            <NuxtLink to="/docs" class="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              View Documentation
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  layout: 'empty',
})

const userData = ref({
  name: '',
  email: '',
  company: '',
  jobTitle: '',
})

const loading = ref(false)

interface EnrichedData {
  email: string;
  magic_score: number;
  user_status: string;
  engagement_level: string;
  surprise_factor: string;
  last_activity: string;
  predicted_interests: string[];
  trust_score: string;
  [key: string]: string | number | string[];
}

const enrichedData = ref<EnrichedData | null>(null)

const features = [
  {
    title: 'Instant Enrichment',
    description: 'Get comprehensive user insights in milliseconds with our powerful API',
    icon: 'carbon:api-1'
  },
  {
    title: 'Rich Data Points',
    description: 'Access detailed user information including magic score and surprise factors',
    icon: 'carbon:data-enrichment'
  },
  {
    title: 'Smart Analysis',
    description: 'Advanced algorithms provide intelligent insights about your users',
    icon: 'carbon:machine-learning'
  }
]

const stats = [
  { value: '10M+', label: 'API Calls Daily' },
  { value: '99.9%', label: 'Uptime' },
  { value: '150ms', label: 'Avg Response Time' },
  { value: '5000+', label: 'Active Customers' },
]

const formatKey = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatValue = (value: string | number | string[]): string => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}

async function enrichUser() {
  loading.value = true
  try {
    const response = await fetch('/api/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData.value),
    })
    
    if (!response.ok) throw new Error('Failed to enrich data')
    
    enrichedData.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
    // TODO: Add proper error handling with toast notification
  } finally {
    loading.value = false
  }
}
</script>

<style>
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 8s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style> 
