<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">All Contacts</h1>
        <p class="text-muted-foreground">
          Manage your contacts and track enrichment progress
        </p>
      </div>
      
      <div class="flex space-x-2">
        <Button variant="outline" @click="selectedContacts.clear(); refreshData()">
          <RotateCcw class="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button 
          :disabled="selectedContacts.size === 0 || enriching" 
          @click="enrichSelected"
        >
          <Zap class="mr-2 h-4 w-4" />
          {{ enriching ? 'Enriching...' : `Enrich Selected (${selectedContacts.size})` }}
        </Button>
      </div>
    </div>

    <!-- Filters and Search -->
    <Card class="p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search contacts..."
              class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
              @input="debouncedSearch"
            >
          </div>
        </div>
        
        <select 
          v-model="statusFilter" 
          class="px-3 py-2 border border-input rounded-md bg-background text-sm"
          @change="applyFilters"
        >
          <option value="">All Status</option>
          <option value="imported">Imported</option>
          <option value="processing">Processing</option>
          <option value="enriched">Enriched</option>
          <option value="failed">Failed</option>
        </select>
        
        <Button variant="outline" size="sm" @click="clearFilters">
          Clear Filters
        </Button>
      </div>
    </Card>

    <!-- Loading State -->
    <Card v-if="pending">
      <div class="p-8 text-center">
        <div class="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"/>
        <p class="text-muted-foreground">Loading contacts...</p>
      </div>
    </Card>

    <!-- Error State -->
    <Card v-else-if="error" class="p-6 border-destructive">
      <div class="flex items-center space-x-2 text-destructive">
        <AlertCircle class="h-4 w-4" />
        <p class="font-medium">Error loading contacts</p>
      </div>
      <p class="text-sm text-muted-foreground mt-2">{{ error }}</p>
      <Button class="mt-4" variant="outline" size="sm" @click="refreshData()">
        Try Again
      </Button>
    </Card>

    <!-- Contacts Table -->
    <Card v-else class="px-0">
      <CardHeader class="border-b !pb-4" >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Contacts {{ data?.total ? `(${data.total})` : '' }}
          </h3>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" :disabled="selectedContacts.size === 0" @click="exportSelected">
              <Download class="mr-2 h-4 w-4" />
              Export ({{ selectedContacts.size }})
            </Button>
          </div>
        </div>
      </CardHeader>

      <div v-if="!data?.contacts?.length" class="p-8 text-center text-muted-foreground">
        <Users class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No contacts found</p>
        <p class="text-sm">Try adjusting your filters or import some contacts</p>
        <Button class="mt-4" @click="navigateTo('/import')">
          <Upload class="mr-2 h-4 w-4" />
          Import Contacts
        </Button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/25">
            <tr>
              <th class="px-4 py-3 text-left">
                <input 
                  type="checkbox" 
                  :checked="isAllSelected"
                  class="rounded border-input"
                  @change="toggleAllSelection"
                >
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium">Contact</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Confidence</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Enriched Data</th>
              <th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="contact in data.contacts" 
              :key="contact._id"
              class="border-t hover:bg-muted/50"
            >
              <td class="px-4 py-3">
                <input 
                  type="checkbox" 
                  :checked="selectedContacts.has(contact._id)"
                  class="rounded border-input"
                  @change="toggleContactSelection(contact._id)"
                >
              </td>
              
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <div class="font-medium">{{ contact.originalContact.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ contact.originalContact.email }}</div>
                  <div v-if="contact.originalContact.phone" class="text-xs text-muted-foreground">
                    {{ contact.originalContact.phone }}
                  </div>
                </div>
              </td>
              
              <td class="px-4 py-3">
                <Badge :variant="getStatusVariant(contact.status)">
                  {{ contact.status }}
                </Badge>
              </td>
              
              <td class="px-4 py-3">
                <div v-if="contact.enrichmentSummary" class="space-y-1">
                  <Badge :variant="getConfidenceBadgeVariant(contact.enrichmentSummary.overallConfidence)">
                    {{ Math.round(contact.enrichmentSummary.overallConfidence) }}%
                  </Badge>
                  <div class="text-xs text-muted-foreground">
                    {{ contact.enrichmentSummary.fieldsEnriched?.length || 0 }} fields enriched
                  </div>
                </div>
                <span v-else class="text-muted-foreground">-</span>
              </td>
              
              <td class="px-4 py-3">
                <div v-if="contact.enrichedContact" class="space-y-1">
                  <div v-if="contact.enrichedContact.company" class="text-sm">
                    {{ contact.enrichedContact.company }}
                  </div>
                  <div v-if="contact.enrichedContact.title" class="text-xs text-muted-foreground">
                    {{ contact.enrichedContact.title }}
                  </div>
                  <div v-if="contact.enrichedContact.location" class="text-xs text-muted-foreground">
                    {{ contact.enrichedContact.location }}
                  </div>
                </div>
                <span v-else class="text-muted-foreground">Not enriched</span>
              </td>
              
              <td class="px-4 py-3">
                <div class="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="viewContact(contact._id)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    :disabled="contact.status === 'processing' || enrichingSingle.has(contact._id)"
                    @click="enrichSingleContact(contact._id)"
                  >
                    <Zap v-if="!enrichingSingle.has(contact._id)" class="h-4 w-4" />
                    <div v-else class="animate-spin h-4 w-4 border-b-2 border-current rounded-full"/>
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="data?.totalPages && data.totalPages > 1" class="border-t px-4 pt-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            Showing {{ ((data.page - 1) * data.pageSize) + 1 }} to {{ Math.min(data.page * data.pageSize, data.total) }} of {{ data.total }} contacts
          </div>
          
          <div class="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              :disabled="data.page === 1"
              @click="goToPage(data.page - 1)"
            >
              Previous
            </Button>
            
            <div class="flex space-x-1">
              <Button 
                v-for="page in visiblePages" 
                :key="page"
                :variant="page === data.page ? 'default' : 'outline'"
                size="sm"
                @click="goToPage(page)"
              >
                {{ page }}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              :disabled="data.page >= data.totalPages"
              @click="goToPage(data.page + 1)"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Contact Details Slide-over -->
    <ContactDetailsSlideover
      :is-open="slideoverOpen"
      :contact-id="selectedContactId"
      @close="closeSlideOver"
      @enriched="handleContactEnriched"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  Download,
  Eye,
  RotateCcw,
  Search,
  Upload,
  Users,
  Zap
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardHeader } from '~/components/ui/card'
import { getConfidenceLevel } from '~/lib/utils'


// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { getContacts, enrichContact, enrichBulkContacts } = useContacts()

// Reactive filters
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Selection state
const selectedContacts = ref(new Set<string>())
const enriching = ref(false)
const enrichingSingle = ref(new Set<string>())

// Slide-over state
const slideoverOpen = ref(false)
const selectedContactId = ref<string | null>(null)

// Fetch contacts data
const { data, pending, error, refresh } = await useLazyAsyncData(
  'contacts',
  async () => {
    return await getContacts({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    })
  },
  {
    watch: [currentPage, statusFilter],
    default: () => ({ contacts: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })
  }
)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    refresh()
  }, 500)
}

// Computed properties
const isAllSelected = computed(() => {
  return data.value?.contacts?.length > 0 && 
    data.value.contacts.every((contact: any) => selectedContacts.value.has(contact._id))
})

const visiblePages = computed(() => {
  if (!data.value?.totalPages) return []
  const total = data.value.totalPages
  const current = data.value.page
  const delta = 2
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  if (current - delta <= 0) {
    end = Math.min(total, end + (delta - current + 1))
  }
  if (current + delta >= total) {
    start = Math.max(1, start - (current + delta - total))
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Methods
const toggleContactSelection = (contactId: string) => {
  if (selectedContacts.value.has(contactId)) {
    selectedContacts.value.delete(contactId)
  } else {
    selectedContacts.value.add(contactId)
  }
}

const toggleAllSelection = () => {
  if (isAllSelected.value) {
    data.value?.contacts?.forEach((contact: any) => {
      selectedContacts.value.delete(contact._id)
    })
  } else {
    data.value?.contacts?.forEach((contact: any) => {
      selectedContacts.value.add(contact._id)
    })
  }
}

const applyFilters = () => {
  currentPage.value = 1
  refresh()
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  refresh()
}

const goToPage = (page: number) => {
  currentPage.value = page
}

const refreshData = () => {
  selectedContacts.value.clear()
  refresh()
}

const enrichSelected = async () => {
  if (selectedContacts.value.size === 0) return
  
  enriching.value = true
  try {
    await enrichBulkContacts(Array.from(selectedContacts.value))
    selectedContacts.value.clear()
    await refresh()
  } catch (error: any) {
    console.error('Bulk enrichment failed:', error)
  } finally {
    enriching.value = false
  }
}

const enrichSingleContact = async (contactId: string) => {
  enrichingSingle.value.add(contactId)
  try {
    await enrichContact(contactId)
    await refresh()
  } catch (error: any) {
    console.error('Contact enrichment failed:', error)
  } finally {
    enrichingSingle.value.delete(contactId)
  }
}

const viewContact = (contactId: string) => {
  selectedContactId.value = contactId
  slideoverOpen.value = true
}

const closeSlideOver = () => {
  slideoverOpen.value = false
  selectedContactId.value = null
}

const handleContactEnriched = async (contactId: string) => {
  // Refresh the contacts list to show updated data
  await refresh()
}

const exportSelected = () => {
  console.log('Exporting contacts:', Array.from(selectedContacts.value))
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
</script> 
 