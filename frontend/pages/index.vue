<template>
  <div class="min-h-screen  text-white">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 pt-12 pb-20">
      <div class="text-center mb-16 space-y-6">
        <h1
          class="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient pb-2">
          Transform Your Leads into<br>Actionable Intelligence
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock the power of AI-driven user enrichment. Get comprehensive insights about your users in milliseconds.
        </p>
        <div class="flex items-center justify-center space-x-4 pt-4">
          <NuxtLink to="/auth/register"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
            Get Started
          </NuxtLink>
          <NuxtLink to="/documentation"
            class="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all duration-200">
            View Documentation
          </NuxtLink>
        </div>
      </div>

      <!-- Interactive Demo Section -->
      <div class="max-w-4xl mx-auto relative">
        <!-- Decorative elements -->
        <div class="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl" />
        <div class="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl" />

        <div class="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700">
          <div
            class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            Live Demo
          </div>

          <form class="space-y-6" @submit.prevent="enrichUser">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Full Name</label>
                <input v-model="userData.name" type="text" placeholder="John Doe"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Email Address</label>
                <input v-model="userData.email" type="email" placeholder="john@example.com"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Company</label>
                <input v-model="userData.company" type="text" placeholder="Acme Inc"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Job Title</label>
                <input v-model="userData.jobTitle" type="text" placeholder="Software Engineer"
                  class="w-full px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              </div>
            </div>

            <button type="submit" :disabled="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50">
              <span v-if="!loading">Enrich Data</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    fill="none" />
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            </button>
          </form>

          <!-- Results Section -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0">
            <div v-if="enrichedData" class="mt-8">
              <!-- Header with overall confidence -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-blue-400">✨ AI-Powered Enrichment Results</h3>
                <div class="flex items-center space-x-3">
                  <div v-if="enrichedData.semantic_search_used" class="flex items-center space-x-1">
                    <Icon name="carbon:search" class="w-4 h-4 text-green-400" />
                    <span class="text-xs text-green-300">Semantic Search</span>
                  </div>
                  <div v-if="enrichedData.confidence_score" class="flex items-center space-x-2">
                    <span class="text-sm text-gray-400">Overall Confidence:</span>
                    <span class="px-3 py-1 rounded-full text-sm font-medium"
                      :class="getConfidenceColor(enrichedData.confidence_score)">
                      {{ enrichedData.confidence_score }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Enhanced Data Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Contact Information -->
                <div class="bg-gray-700/30 p-6 rounded-xl border border-gray-600/30">
                  <h4 class="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                    <Icon name="carbon:user" class="w-5 h-5 mr-2" />
                    Contact Details
                  </h4>
                  <div class="space-y-3">
                    <div v-for="field in ['name', 'email', 'job_title', 'company', 'location', 'phone']" :key="field"
                      class="flex justify-between items-center">
                      <span class="text-gray-400 text-sm">{{ formatKey(field) }}:</span>
                      <div class="flex items-center space-x-2">
                        <span class="text-white text-sm">{{ enrichedData[field] || 'Not found' }}</span>
                        <span v-if="enrichedData.confidence_details?.[field]" class="px-2 py-1 rounded text-xs"
                          :class="getConfidenceColor(enrichedData.confidence_details[field])">
                          {{ enrichedData.confidence_details[field] }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Professional Information -->
                <div class="bg-gray-700/30 p-6 rounded-xl border border-gray-600/30">
                  <h4 class="text-lg font-semibold text-green-300 mb-4 flex items-center">
                    <Icon name="carbon:identification" class="w-5 h-5 mr-2" />
                    Professional Profile
                  </h4>
                  <div class="space-y-3">
                    <div>
                      <span class="text-gray-400 text-sm">Bio:</span>
                      <p class="text-white text-sm mt-1">{{ enrichedData.bio || 'Not available' }}</p>
                      <span v-if="enrichedData.confidence_details?.bio"
                        class="inline-block mt-1 px-2 py-1 rounded text-xs"
                        :class="getConfidenceColor(enrichedData.confidence_details.bio)">
                        {{ enrichedData.confidence_details.bio }}% confidence
                      </span>
                    </div>
                    <div v-if="enrichedData.skills && enrichedData.skills.length > 0">
                      <span class="text-gray-400 text-sm">Skills:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        <span v-for="skill in enrichedData.skills" :key="skill"
                          class="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                          {{ skill }}
                        </span>
                      </div>
                      <span v-if="enrichedData.confidence_details?.skills"
                        class="inline-block mt-1 px-2 py-1 rounded text-xs"
                        :class="getConfidenceColor(enrichedData.confidence_details.skills)">
                        {{ enrichedData.confidence_details.skills }}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Social Profiles -->
              <div v-if="hasSocialProfiles" class="bg-gray-700/30 p-6 rounded-xl border border-gray-600/30 mb-6">
                <h4 class="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                  <Icon name="carbon:share" class="w-5 h-5 mr-2" />
                  Social Profiles
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="platform in ['linkedin', 'github', 'twitter', 'personal_blog']" :key="platform"
                    class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm capitalize">{{ formatKey(platform) }}:</span>
                    <div class="flex items-center space-x-2">
                      <a v-if="enrichedData[platform] && enrichedData[platform] !== 'Not found'"
                        :href="enrichedData[platform]" target="_blank"
                        class="text-blue-400 hover:text-blue-300 text-sm truncate max-w-48">
                        {{ enrichedData[platform] }}
                      </a>
                      <span v-else class="text-gray-500 text-sm">Not found</span>
                      <span v-if="platform === 'linkedin' && enrichedData.confidence_details?.linkedin"
                        class="px-2 py-1 rounded text-xs"
                        :class="getConfidenceColor(enrichedData.confidence_details.linkedin)">
                        {{ enrichedData.confidence_details.linkedin }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Data Sources -->
              <div v-if="enrichedData.sources && Object.keys(enrichedData.sources).length > 0" class="mb-6">
                <h4 class="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <Icon name="carbon:data-base" class="w-4 h-4 mr-2" />
                  Data Sources
                </h4>
                <div class="flex flex-wrap gap-2">
                  <div v-for="(source, field) in enrichedData.sources" :key="field"
                    class="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg text-xs">
                    <span class="font-medium">{{ formatKey(String(field)) }}:</span>
                    <span class="ml-1">{{ source }}</span>
                  </div>
                </div>
              </div>

              <!-- Enrichment Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Fields Successfully Enriched -->
                <div v-if="enrichedData.fields_enriched && enrichedData.fields_enriched.length > 0">
                  <h4 class="text-sm font-medium text-green-400 mb-3 flex items-center">
                    <Icon name="carbon:checkmark" class="w-4 h-4 mr-2" />
                    Successfully Enriched ({{ enrichedData.fields_enriched.length }})
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="field in enrichedData.fields_enriched" :key="field"
                      class="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                      {{ formatKey(field) }}
                    </span>
                  </div>
                </div>

                <!-- Fields Not Found -->
                <div v-if="enrichedData.fields_not_found && enrichedData.fields_not_found.length > 0">
                  <h4 class="text-sm font-medium text-orange-400 mb-3 flex items-center">
                    <Icon name="carbon:warning" class="w-4 h-4 mr-2" />
                    Not Found ({{ enrichedData.fields_not_found.length }})
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="field in enrichedData.fields_not_found" :key="field"
                      class="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs">
                      {{ formatKey(field) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Metadata -->
              <div v-if="enrichedData.data_source" class="mt-6 pt-4 border-t border-gray-600/30">
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>{{ enrichedData.data_source }}</span>
                  <span v-if="enrichedData.enrichment_timestamp">
                    {{ new Date(enrichedData.enrichment_timestamp).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Error Message -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0">
            <div v-if="errorMessage" class="mt-8 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
              <div class="flex items-center space-x-2">
                <Icon name="carbon:warning" class="w-5 h-5 text-red-400" />
                <div>
                  <p class="text-red-400 font-medium">Enrichment Failed</p>
                  <p class="text-red-300 text-sm">{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>





      <!-- Features Section -->
      <div class="mt-32 grid md:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title"
          class="group p-6 bg-gray-800/30 rounded-xl border border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div class="text-blue-400 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon :name="feature.icon" />
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
          <p class="text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
      <!-- faq section -->
      <div class="w-full mt-32">
        <h2 class="text-3xl md:text-4xl font-bold pb-2  text-white">
          Why LeadUp?
        </h2>
        <div class="mt-6">
          <AccordionDemo />
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
          <h2 class="text-3xl md:text-4xl font-bold mb-4 ">Ready to Get Started ?</h2>
          <p class="text-xl text-gray-200 mb-8">Transform your user data into actionable insights today.</p>
          <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <NuxtLink to="/auth/register"
              class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold  transition-colors">
              Get Started
            </NuxtLink>
            <NuxtLink to="/documentation"
              class="px-8 py-4 bg-transparent border-2 border-white rounded-lg font-semibold  transition-colors">
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
import AccordionDemo from '~/components/ui/accordion/index.vue'
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui'

definePageMeta({
  layout: 'home',
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
  name: string;
  company: string;
  job_title: string;
  location?: string;
  bio?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  personal_blog?: string;
  industry?: string;
  phone?: string;
  confidence_score?: number;
  sources?: Record<string, string>;
  fields_enriched?: string[];
  fields_not_found?: string[];
  confidence_details?: Record<string, number>;
  semantic_search_used?: boolean;
  original_contact?: { name: string; email: string };
  enrichment_timestamp?: string;
  data_source?: string;
  // Legacy fields for backward compatibility
  magic_score?: number;
  user_status?: string;
  engagement_level?: string;
  surprise_factor?: string;
  last_activity?: string;
  predicted_interests?: string[];
  trust_score?: string;
  social_profiles?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    personal_blog?: string;
  };
  [key: string]: any;
}

const enrichedData = ref<EnrichedData | null>(null)
const errorMessage = ref<string | null>(null)

// Check if any social profiles are available
const hasSocialProfiles = computed(() => {
  if (!enrichedData.value) return false
  return Boolean(
    enrichedData.value.linkedin ||
    enrichedData.value.github ||
    enrichedData.value.twitter ||
    enrichedData.value.personal_blog
  )
})

// Filter out metadata fields from display
const filteredEnrichedData = computed(() => {
  if (!enrichedData.value) return {}

  const filtered: Record<string, string> = {}
  const excludeFields = ['sources', 'fields_enriched', 'fields_not_found', 'confidence_score', 'confidence_details', 'semantic_search_used', 'original_contact', 'enrichment_timestamp', 'data_source']

  Object.entries(enrichedData.value).forEach(([key, value]) => {
    if (!excludeFields.includes(key) && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        filtered[key] = value.join(', ')
      } else if (typeof value === 'object') {
        filtered[key] = JSON.stringify(value, null, 2)
      } else {
        filtered[key] = String(value)
      }
    }
  })

  return filtered
})

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

const getConfidenceColor = (confidence: number): string => {
  if (confidence < 50) return 'bg-red-600/20 text-red-300'
  if (confidence < 75) return 'bg-yellow-600/20 text-yellow-300'
  return 'bg-green-600/20 text-green-300'
}

async function enrichUser() {
  loading.value = true
  errorMessage.value = null
  enrichedData.value = null

  try {
    const response = await fetch('/api/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData.value),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || `HTTP ${response.status}`)
    }

    enrichedData.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to enrich data'
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
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
