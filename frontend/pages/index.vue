<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to your Contact Enrichment CRM. Manage and enrich your contacts with confidence.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="i in 4" :key="i" class="p-6">
        <div class="space-y-3">
          <div class="h-4 bg-accent rounded animate-pulse"/>
          <div class="h-8 bg-accent rounded animate-pulse"/>
          <div class="h-3 bg-accent rounded animate-pulse w-3/4"/>
        </div>
      </Card>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card class="p-6">
        <div class="flex items-center space-x-2">
          <Users class="h-4 w-4 text-muted-foreground" />
          <h3 class="text-sm font-medium">Total Contacts</h3>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-bold">{{ stats?.totalContacts || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            Total contacts in your system
          </p>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center space-x-2">
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
          <h3 class="text-sm font-medium">Enriched Contacts</h3>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-bold">{{ stats?.enrichedContacts || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            Successfully enriched contacts
          </p>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center space-x-2">
          <Clock class="h-4 w-4 text-muted-foreground" />
          <h3 class="text-sm font-medium">Processing</h3>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-bold">{{ stats?.processingContacts || 0 }}</div>
          <p class="text-xs text-muted-foreground">
            Currently being processed
          </p>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center space-x-2">
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
          <h3 class="text-sm font-medium">Avg. Confidence</h3>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-bold">{{ Math.round(stats?.averageConfidence || 0) }}%</div>
          <Badge :variant="getConfidenceBadgeVariant(stats?.averageConfidence || 0)">
            {{ getConfidenceLevel(stats?.averageConfidence || 0) }}
          </Badge>
        </div>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-if="error" class="p-6 border-destructive">
      <div class="flex items-center space-x-2 text-destructive">
        <AlertCircle class="h-4 w-4" />
        <p class="font-medium">Error loading dashboard data</p>
      </div>
      <p class="text-sm text-muted-foreground mt-2">{{ error }}</p>
      <Button class="mt-4" variant="outline" size="sm" @click="refresh()">
        Try Again
      </Button>
    </Card>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="p-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Upload class="h-5 w-5 text-primary" />
            <h3 class="text-lg font-semibold">Import Contacts</h3>
          </div>
          <p class="text-muted-foreground">
            Upload an Excel file to import new contacts for enrichment.
          </p>
          <Button class="w-full" @click="navigateTo('/import')">
            <Upload class="mr-2 h-4 w-4" />
            Start Import
          </Button>
        </div>
      </Card>

      <Card class="p-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Zap class="h-5 w-5 text-primary" />
            <h3 class="text-lg font-semibold">Bulk Enrichment</h3>
          </div>
          <p class="text-muted-foreground">
            Enrich multiple contacts at once with our AI-powered system.
          </p>
          <Button variant="outline" class="w-full" @click="navigateTo('/contacts')">
            <Zap class="mr-2 h-4 w-4" />
            View Contacts
          </Button>
        </div>
      </Card>

      <Card class="p-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Download class="h-5 w-5 text-primary" />
            <h3 class="text-lg font-semibold">Export Data</h3>
          </div>
          <p class="text-muted-foreground">
            Export enriched contacts with confidence scores and additional data.
          </p>
          <Button variant="outline" class="w-full" @click="navigateTo('/export')">
            <Download class="mr-2 h-4 w-4" />
            Export Now
          </Button>
        </div>
      </Card>
    </div>

    <!-- API Status -->
    <Card class="p-6">
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">System Status</h3>
        <div class="flex items-center space-x-2">
          <div
:class="[
            'w-2 h-2 rounded-full',
            healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
          ]"/>
          <span class="text-sm">
            API Status: {{ healthStatus === 'healthy' ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  TrendingUp,
  Upload,
  Users,
  Zap
} from 'lucide-vue-next'
import { getConfidenceLevel } from '~/lib/utils'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { getContactStats, checkHealth } = useContacts()

// Fetch dashboard data
const { data: stats, pending, error, refresh } = await useLazyAsyncData('dashboard-stats', async () => {
  try {
    return await getContactStats()
  } catch (err: any) {
    throw new Error(err.message || 'Failed to load dashboard statistics')
  }
})

// Check API health
const healthStatus = ref('checking')
onMounted(async () => {
  try {
    const health = await checkHealth()
    healthStatus.value = health.status === 'healthy' ? 'healthy' : 'unhealthy'
  } catch (error) {
    healthStatus.value = 'unhealthy'
  }
})

function getConfidenceBadgeVariant(score: number) {
  const level = getConfidenceLevel(score)
  switch (level) {
    case 'low': return 'destructive'
    case 'medium': return 'warning'
    case 'high': return 'success'
    default: return 'secondary'
  }
}
</script> 
