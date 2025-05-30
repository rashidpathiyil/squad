<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div>
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to your Contact Enrichment CRM. Manage and enrich your contacts with confidence.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <template v-if="pending">
        <Card v-for="i in 4" :key="i" class="rounded-lg">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="h-5 w-5 rounded-full bg-muted animate-pulse"/>
              <div class="h-5 w-24 rounded bg-muted animate-pulse"/>
            </div>
            <div class="h-8 w-20 rounded bg-muted animate-pulse mb-1"/>
            <div class="h-4 w-32 rounded bg-muted animate-pulse"/>
          </div>
        </Card>
      </template>

      <template v-else>
        <Card class="rounded-lg">
          <div >
            <div class="flex items-center gap-2 mb-4">
              <Users class="h-5 w-5 text-muted-foreground" />
              <span class="text-base font-medium">Total Contacts</span>
            </div>
            <p class="text-3xl font-semibold mb-1">{{ stats?.totalContacts || 0 }}</p>
            <p class="text-sm text-muted-foreground">
              Total contacts in your system
            </p>
          </div>
        </Card>

        <Card class="rounded-lg">
          <div >
            <div class="flex items-center gap-2 mb-4">
              <CheckCircle class="h-5 w-5 text-muted-foreground" />
              <span class="text-base font-medium">Enriched Contacts</span>
            </div>
            <p class="text-3xl font-semibold mb-1">{{ stats?.enrichedContacts || 0 }}</p>
            <p class="text-sm text-muted-foreground">
              Successfully enriched contacts
            </p>
          </div>
        </Card>

        <Card class="rounded-lg">
          <div >
            <div class="flex items-center gap-2 mb-4">
              <Clock class="h-5 w-5 text-muted-foreground" />
              <span class="text-base font-medium">Processing</span>
            </div>
            <p class="text-3xl font-semibold mb-1">{{ stats?.processingContacts || 0 }}</p>
            <p class="text-sm text-muted-foreground">
              Currently being processed
            </p>
          </div>
        </Card>

        <Card class="rounded-lg">
          <div >
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="h-5 w-5 text-muted-foreground" />
              <span class="text-base font-medium">Avg. Confidence</span>
            </div>
            <p class="text-3xl font-semibold mb-1">{{ Math.round(stats?.averageConfidence || 0) }}%</p>
            <Badge variant="destructive" class="rounded-full px-3 py-0.5 text-xs font-medium">
              low
            </Badge>
          </div>
        </Card>
      </template>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="rounded-lg">
        <div >
          <div class="flex items-center gap-2 text-primary mb-2">
            <Upload class="h-5 w-5" />
            <span class="text-base font-medium">Import Contacts</span>
          </div>
          <p class="text-sm text-muted-foreground mb-4">
            Upload an Excel file to import new contacts for enrichment.
          </p>
          <Button 
            variant="default" 
            class="w-full justify-center items-center gap-2 bg-primary" 
            @click="navigateTo('/import')"
          >
            <Upload class="h-4 w-4" />
            Start Import
          </Button>
        </div>
      </Card>

      <Card class="rounded-lg">
        <div >
          <div class="flex items-center gap-2 text-primary mb-2">
            <Zap class="h-5 w-5" />
            <span class="text-base font-medium">Bulk Enrichment</span>
          </div>
          <p class="text-sm text-muted-foreground mb-4">
            Enrich multiple contacts at once with our AI-powered system.
          </p>
          <Button 
            variant="outline" 
            class="w-full justify-center items-center gap-2 bg-white" 
            @click="navigateTo('/contacts')"
          >
            <Zap class="h-4 w-4" />
            View Contacts
          </Button>
        </div>
      </Card>

      <Card class="rounded-lg">
        <div >
          <div class="flex items-center gap-2 text-primary mb-2">
            <Download class="h-5 w-5" />
            <span class="text-base font-medium">Export Data</span>
          </div>
          <p class="text-sm text-muted-foreground mb-4">
            Export enriched contacts with confidence scores and additional data.
          </p>
          <Button 
            variant="outline" 
            class="w-full justify-center items-center gap-2 bg-white" 
            @click="navigateTo('/export')"
          >
            <Download class="h-4 w-4" />
            Export Now
          </Button>
        </div>
      </Card>
    </div>

    <!-- System Status -->
    <Card class="rounded-lg">
      <div >
        <h3 class="text-base font-medium mb-4">System Status</h3>
        <div class="flex items-center gap-2">
          <div class="relative flex h-2 w-2">
            <div class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"/>
            <div class="relative inline-flex h-2 w-2 rounded-full bg-green-500"/>
          </div>
          <span class="text-sm">
            API Status: Connected
          </span>
        </div>
      </div>
    </Card>

    <!-- Error State -->
    <Card v-if="error" class="rounded-lg">
      <div class="p-6 space-y-3">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-5 w-5" />
          <p class="font-medium">Error loading dashboard data</p>
        </div>
        <p class="text-sm text-muted-foreground">{{ error }}</p>
        <Button variant="outline" size="sm" @click="refresh()">
          Try Again
        </Button>
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
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { getContactStats, checkHealth } = useContacts()

// Fetch dashboard data
const { data: stats, pending, error, refresh } = await useLazyAsyncData('dashboard-stats', async () => {
  try {
    return await getContactStats()
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Failed to load dashboard statistics')
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
</script> 
