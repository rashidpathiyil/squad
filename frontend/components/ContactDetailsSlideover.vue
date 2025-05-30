<template>
  <Sheet :open="isOpen" @update:open="handleOpenChange">
    <SheetContent class="w-full sm:max-w-3xl overflow-y-auto p-6">
      <SheetHeader class="border-b pb-4 mb-6">
        <div class="flex items-center space-x-3">
          <div v-if="contact" class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span class="text-lg font-medium text-primary-foreground">
              {{ contact.originalContact.name.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <SheetTitle>Contact Details</SheetTitle>
            <SheetDescription v-if="contact">{{ contact.originalContact.name }}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4 px-2">
        <div class="h-4 bg-accent rounded animate-pulse"/>
        <div class="h-4 bg-accent rounded animate-pulse w-3/4"/>
        <div class="h-4 bg-accent rounded animate-pulse w-1/2"/>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8 px-2">
        <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
        <p class="text-destructive font-medium">Failed to load contact</p>
        <p class="text-sm text-muted-foreground mt-2">{{ error }}</p>
        <Button variant="outline" size="sm" class="mt-4" @click="fetchContact">
          Try Again
        </Button>
      </div>

      <!-- Contact Details -->
      <div v-else-if="contact" class="space-y-8 px-2">
        <!-- Status and Overview -->
        <div class="flex items-center justify-between">
          <Badge :variant="getStatusVariant(contact.status)" class="text-sm px-3 py-1">
            {{ contact.status.toUpperCase() }}
          </Badge>
          <div v-if="contact.enrichmentSummary" class="text-right">
            <Badge :variant="getConfidenceBadgeVariant(contact.enrichmentSummary.overallConfidence)" class="text-sm">
              {{ Math.round(contact.enrichmentSummary.overallConfidence) }}% Confidence
            </Badge>
            <p class="text-xs text-muted-foreground mt-1">
              {{ contact.enrichmentSummary.fieldsEnriched?.length || 0 }} fields enriched
            </p>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Original Contact Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div class="h-2 w-2 rounded-full bg-blue-500"/>
              <h3 class="font-semibold text-lg">Original Information</h3>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-4 space-y-3">
              <!-- Dynamic rendering of originalContact fields -->
              <div v-for="[key, value] in originalContactFields" :key="`original-${key}`" class="flex justify-between items-start">
                <span class="text-sm font-medium text-blue-700 capitalize">{{ formatFieldName(key) }}:</span>
                <div class="text-right max-w-[60%]">
                  <span v-if="Array.isArray(value)" class="text-sm">
                    <Badge v-for="item in value" :key="item" variant="outline" class="text-xs mr-1 mb-1">{{ item }}</Badge>
                  </span>
                  <span v-else-if="typeof value === 'object'" class="text-sm">
                    <div v-for="[subKey, subValue] in Object.entries(value)" :key="subKey" class="text-xs">
                      <strong>{{ formatFieldName(subKey) }}:</strong> {{ subValue }}
                    </div>
                  </span>
                  <span v-else class="text-sm font-medium">{{ value }}</span>
                </div>
              </div>

              <!-- Custom Fields -->
              <div v-if="contact.originalContact.customFields && Object.keys(contact.originalContact.customFields).length > 0" class="border-t border-blue-200 pt-3">
                <h4 class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <Tag class="h-3 w-3 mr-1" />
                  Custom Fields
                </h4>
                <div class="space-y-2">
                  <div v-for="[key, value] in Object.entries(contact.originalContact.customFields)" :key="`custom-${key}`" class="flex justify-between">
                    <span class="text-xs font-medium text-blue-600 capitalize">{{ formatFieldName(key) }}:</span>
                    <span class="text-xs">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enriched Contact Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div class="h-2 w-2 rounded-full bg-green-500"/>
              <h3 class="font-semibold text-lg">Enriched Information</h3>
            </div>

            <div v-if="contact.enrichedContact" class="bg-green-50 rounded-lg p-4 space-y-3">
              <!-- Dynamic rendering of enrichedContact fields -->
              <div v-for="[key, value] in enrichedContactFields" :key="`enriched-${key}`" class="space-y-2">
                <div class="flex justify-between items-start">
                  <span class="text-sm font-medium text-green-700 capitalize flex items-center">
                    {{ formatFieldName(key) }}:
                    <Badge v-if="getConfidenceScore(key)" :variant="getFieldConfidenceBadge(getConfidenceScore(key))" class="text-xs ml-2">
                      {{ getConfidenceScore(key) }}%
                    </Badge>
                  </span>
                  <div class="text-right max-w-[60%]">
                    <!-- Handle different value types -->
                    <div v-if="key === 'socialProfiles' && typeof value === 'object'" class="space-y-1">
                      <div v-for="[platform, url] in Object.entries(value)" :key="platform" class="flex items-center justify-end space-x-2">
                        <a :href="url as string" target="_blank" class="text-xs text-primary hover:underline flex items-center">
                        <span class="text-xs capitalize">{{ platform }} </span>
                          <ExternalLink class="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    <div v-else-if="Array.isArray(value)" class="flex flex-wrap justify-end gap-1">
                      <Badge v-for="item in value" :key="item" variant="outline" class="text-xs">{{ item }}</Badge>
                    </div>
                    <div v-else-if="key === 'bio'" class="text-xs leading-relaxed">{{ value }}</div>
                    <span v-else class="text-sm font-medium">{{ value }}</span>
                  </div>
                </div>
                
                <!-- Source information if available -->
                <div v-if="getSourceInfo(key)" class="text-xs text-muted-foreground italic flex items-center justify-end">
                  <Info class="h-3 w-3 mr-1" />
                  Source: {{ getSourceInfo(key) }}
                </div>
              </div>
            </div>
            
            <div v-else class="bg-gray-50 rounded-lg p-4 text-center text-muted-foreground">
              <Zap class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No enriched data available</p>
              <p class="text-xs">Enrich this contact to see additional information</p>
            </div>
          </div>
        </div>

        <!-- Enrichment Summary Section -->
        <div v-if="contact.enrichmentSummary" class="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 class="font-semibold text-lg flex items-center">
            <BarChart3 class="h-5 w-5 mr-2" />
            Enrichment Analysis
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Overall Stats -->
            <div class="space-y-3">
              <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Overall Metrics</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm">Confidence Score:</span>
                  <Badge :variant="getConfidenceBadgeVariant(contact.enrichmentSummary.overallConfidence)">
                    {{ Math.round(contact.enrichmentSummary.overallConfidence) }}%
                  </Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Fields Found:</span>
                  <span class="text-sm font-medium">{{ contact.enrichmentSummary.fieldsEnriched?.length || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Fields Missing:</span>
                  <span class="text-sm font-medium">{{ contact.enrichmentSummary.fieldsNotFound?.length || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Enriched Fields -->
            <div v-if="contact.enrichmentSummary.fieldsEnriched?.length" class="space-y-3">
              <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Successfully Enriched</h4>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="field in contact.enrichmentSummary.fieldsEnriched" 
                  :key="`enriched-${field}`" 
                  variant="outline" 
                  class="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  ✓ {{ formatFieldName(field) }}
                </Badge>
              </div>
            </div>

            <!-- Missing Fields -->
            <div v-if="contact.enrichmentSummary.fieldsNotFound?.length" class="space-y-3">
              <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Not Found</h4>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="field in contact.enrichmentSummary.fieldsNotFound" 
                  :key="`missing-${field}`" 
                  variant="outline" 
                  class="text-xs bg-red-50 text-red-700 border-red-200"
                >
                  ✗ {{ formatFieldName(field) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="bg-muted/20 rounded-lg p-4">
          <h4 class="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
            <Clock class="h-4 w-4 mr-2" />
            Timeline
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="flex flex-col">
              <span class="text-muted-foreground">Created</span>
              <span class="font-medium">{{ formatContactDate(contact.created_at) }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-muted-foreground">Last Updated</span>
              <span class="font-medium">{{ formatContactDate(contact.updated_at) }}</span>
            </div>
            <div v-if="contact.enriched_at" class="flex flex-col">
              <span class="text-muted-foreground">Enriched</span>
              <span class="font-medium">{{ formatContactDate(contact.enriched_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex space-x-3 pt-4 border-t">
          <Button 
            :disabled="enriching || contact.status === 'processing'" 
            class="flex-1"
            @click="enrichContact"
          >
            <Zap v-if="!enriching" class="mr-2 h-4 w-4" />
            <div v-else class="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full"/>
            {{ enriching ? 'Enriching...' : contact.status === 'enriched' ? 'Re-enrich Contact' : 'Enrich Contact' }}
          </Button>
          <Button variant="outline" @click="close">
            Close
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  BarChart3,
  Clock,
  ExternalLink,
  Info,
  Tag,
  Zap
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '~/components/ui/sheet'
import { formatDate, getConfidenceLevel } from '~/lib/utils'
import type { ConfidenceScores, Contact, Sources } from '~/types/contact'

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

// Dynamic field extraction for originalContact (excluding customFields)
const originalContactFields = computed(() => {
  if (!contact.value?.originalContact) return []
  const { customFields, ...otherFields } = contact.value.originalContact
  return Object.entries(otherFields).filter(([_, value]) => value != null && value !== '')
})

// Dynamic field extraction for enrichedContact
const enrichedContactFields = computed(() => {
  if (!contact.value?.enrichedContact) return []
  return Object.entries(contact.value.enrichedContact).filter(([_, value]) => value != null && value !== '')
})

const formatFieldName = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Url$/, ' URL')
}

const getConfidenceScore = (fieldName: string): number | null => {
  if (!contact.value?.confidenceScores) return null
  
  const scores = contact.value.confidenceScores as ConfidenceScores
  
  // Direct field access
  if (fieldName in scores && typeof scores[fieldName as keyof ConfidenceScores] === 'number') {
    return scores[fieldName as keyof ConfidenceScores] as number
  }
  
  // Handle nested socialProfiles
  if (fieldName === 'socialProfiles' && scores.socialProfiles) {
    const socialScores = Object.values(scores.socialProfiles)
    return socialScores.length > 0 && typeof socialScores[0] === 'number' ? socialScores[0] : null
  }
  
  return null
}

const getFieldConfidenceBadge = (score: number | null) => {
  if (score === null) return 'secondary'
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'destructive'
}

const getSourceInfo = (fieldName: string): string | null => {
  if (!contact.value?.sources) return null
  const sources = contact.value.sources as Sources
  return sources[fieldName] || null
}

const formatContactDate = (dateValue: string | Date | undefined): string => {
  if (!dateValue) return 'N/A'
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return formatDate(date)
  } catch (error) {
    console.error('Error formatting date:', error, dateValue)
    return 'Invalid date'
  }
}

const fetchContact = async () => {
  if (!props.contactId) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await getContact(props.contactId)
    contact.value = response.contact
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load contact details'
    error.value = errorMessage
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
  } catch (err: unknown) {
    console.error('Error enriching contact:', err)
  } finally {
    enriching.value = false
  }
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    close()
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
