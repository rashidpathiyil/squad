<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-hidden"
    @click="close"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
    
    <!-- Slide-over panel -->
    <div class="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between border-b px-6 py-4">
        <h2 class="text-lg font-semibold">Contact Details</h2>
        <Button variant="ghost" size="icon" @click="close">
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="h-4 bg-accent rounded animate-pulse"/>
          <div class="h-4 bg-accent rounded animate-pulse w-3/4"/>
          <div class="h-4 bg-accent rounded animate-pulse w-1/2"/>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p class="text-destructive font-medium">Failed to load contact</p>
          <p class="text-sm text-muted-foreground mt-2">{{ error }}</p>
          <Button variant="outline" size="sm" class="mt-4" @click="fetchContact">
            Try Again
          </Button>
        </div>

        <!-- Contact Details -->
        <div v-else-if="contact" class="space-y-6">
          <!-- Basic Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span class="text-lg font-medium text-primary-foreground">
                  {{ contact.originalContact.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-semibold">{{ contact.originalContact.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ contact.originalContact.email }}</p>
              </div>
            </div>

            <!-- Status Badge -->
            <Badge :variant="getStatusVariant(contact.status)" class="w-fit">
              {{ contact.status }}
            </Badge>
          </div>

          <!-- Original Contact Info -->
          <div class="space-y-3">
            <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Original Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Name:</span>
                <span class="text-sm font-medium">{{ contact.originalContact.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Email:</span>
                <span class="text-sm font-medium">{{ contact.originalContact.email }}</span>
              </div>
              <div v-if="contact.originalContact.phone" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Phone:</span>
                <span class="text-sm font-medium">{{ contact.originalContact.phone }}</span>
              </div>
              <div v-if="contact.originalContact.company" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Company:</span>
                <span class="text-sm font-medium">{{ contact.originalContact.company }}</span>
              </div>
              <div v-if="contact.originalContact.title" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Title:</span>
                <span class="text-sm font-medium">{{ contact.originalContact.title }}</span>
              </div>
            </div>
          </div>

          <!-- Enriched Data -->
          <div v-if="contact.enrichedContact" class="space-y-3">
            <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Enriched Information</h4>
            <div class="space-y-2">
              <div v-if="contact.enrichedContact.company" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Company:</span>
                <span class="text-sm font-medium">{{ contact.enrichedContact.company }}</span>
              </div>
              <div v-if="contact.enrichedContact.title" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Title:</span>
                <span class="text-sm font-medium">{{ contact.enrichedContact.title }}</span>
              </div>
              <div v-if="contact.enrichedContact.location" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Location:</span>
                <span class="text-sm font-medium">{{ contact.enrichedContact.location }}</span>
              </div>
              <div v-if="contact.enrichedContact.industry" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Industry:</span>
                <span class="text-sm font-medium">{{ contact.enrichedContact.industry }}</span>
              </div>
              <div v-if="contact.enrichedContact.phone" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Phone:</span>
                <span class="text-sm font-medium">{{ contact.enrichedContact.phone }}</span>
              </div>
              <div v-if="contact.enrichedContact.linkedinUrl" class="flex justify-between">
                <span class="text-sm text-muted-foreground">LinkedIn:</span>
                <a 
                  :href="contact.enrichedContact.linkedinUrl" 
                  target="_blank" 
                  class="text-sm font-medium text-primary hover:underline"
                >
                  View Profile
                </a>
              </div>
            </div>
          </div>

          <!-- Enrichment Summary -->
          <div v-if="contact.enrichmentSummary" class="space-y-3">
            <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Enrichment Summary</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Confidence:</span>
                <Badge :variant="getConfidenceBadgeVariant(contact.enrichmentSummary.overallConfidence)">
                  {{ Math.round(contact.enrichmentSummary.overallConfidence) }}%
                </Badge>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Fields Enriched:</span>
                <span class="text-sm font-medium">{{ contact.enrichmentSummary.fieldsEnriched?.length || 0 }}</span>
              </div>
              <div v-if="contact.enrichmentSummary.fieldsEnriched?.length" class="mt-2">
                <span class="text-sm text-muted-foreground">Enriched Fields:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="field in contact.enrichmentSummary.fieldsEnriched" 
                    :key="field" 
                    variant="outline" 
                    class="text-xs"
                  >
                    {{ field }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="space-y-3">
            <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Timestamps</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Created:</span>
                <span class="text-sm font-medium">{{ formatDate(contact.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Updated:</span>
                <span class="text-sm font-medium">{{ formatDate(contact.updatedAt) }}</span>
              </div>
              <div v-if="contact.enrichedAt" class="flex justify-between">
                <span class="text-sm text-muted-foreground">Enriched:</span>
                <span class="text-sm font-medium">{{ formatDate(contact.enrichedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div v-if="contact" class="border-t px-6 py-4 space-y-2">
        <Button 
          :disabled="enriching || contact.status === 'processing'" 
          class="w-full"
          @click="enrichContact"
        >
          <Zap v-if="!enriching" class="mr-2 h-4 w-4" />
          <div v-else class="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full"/>
          {{ enriching ? 'Enriching...' : 'Enrich Contact' }}
        </Button>
        <Button variant="outline" class="w-full" @click="close">
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Contact } from '~/types/contact'
import { getConfidenceLevel, formatDate } from '~/lib/utils'
import { X, AlertCircle, Zap } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  contactId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  enriched: [contactId: string]
}>()

const { getContact, enrichContact: enrichContactApi } = useContacts()

const contact = ref<Contact | null>(null)
const loading = ref(false)
const error = ref('')
const enriching = ref(false)

const fetchContact = async () => {
  if (!props.contactId) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await getContact(props.contactId)
    contact.value = response.contact
  } catch (err: any) {
    error.value = err.message || 'Failed to load contact details'
    console.error('Error fetching contact:', err)
  } finally {
    loading.value = false
  }
}

const enrichContact = async () => {
  if (!props.contactId) return
  
  enriching.value = true
  try {
    await enrichContactApi(props.contactId)
    emit('enriched', props.contactId)
    // Refresh contact data
    await fetchContact()
  } catch (err: any) {
    console.error('Error enriching contact:', err)
  } finally {
    enriching.value = false
  }
}

const close = () => {
  emit('close')
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'imported': return 'secondary'
    case 'processing': return 'warning'
    case 'enriched': return 'success'
    case 'failed': return 'destructive'
    default: return 'outline'
  }
}

const getConfidenceBadgeVariant = (score: number) => {
  const level = getConfidenceLevel(score)
  switch (level) {
    case 'low': return 'destructive'
    case 'medium': return 'warning'
    case 'high': return 'success'
    default: return 'secondary'
  }
}

// Watch for changes in contactId to fetch new contact
watch(() => props.contactId, (newId) => {
  if (newId && props.isOpen) {
    contact.value = null
    fetchContact()
  }
}, { immediate: true })

// Watch for isOpen changes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.contactId && !contact.value) {
    fetchContact()
  }
})
</script> 
