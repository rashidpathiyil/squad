import type { Contact, EnhancedBulkCreateRequest, EnhancedImportResult, OriginalContact } from '~/types/contact'

interface ContactsResponse {
  contacts: Contact[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ContactResponse {
  contact: Contact
}

interface BulkCreateResponse {
  message: string
  totalCreated: number
  contacts: Contact[]
  errors: string[]
  totalErrors: number
}

interface ContactStats {
  totalContacts: number
  enrichedContacts: number
  processingContacts: number
  failedContacts: number
  averageConfidence: number
}

interface EnrichBulkResponse {
  message: string
  count: number
}

export const useContacts = () => {
  const { get, post, postBulk } = useApi()

  // Get all contacts with pagination and filtering
  const getContacts = async (params: {
    page?: number
    pageSize?: number
    status?: string
    search?: string
  } = {}) => {
    const query = new URLSearchParams()
    
    if (params.page) query.append('page', params.page.toString())
    if (params.pageSize) query.append('pageSize', params.pageSize.toString())
    if (params.status) query.append('status', params.status)
    if (params.search) query.append('search', params.search)

    const queryString = query.toString()
    const endpoint = queryString ? `/contacts?${queryString}` : '/contacts'
    
    return await get<ContactsResponse>(endpoint)
  }

  // Get single contact by ID
  const getContact = async (id: string) => {
    return await get<ContactResponse>(`/contacts/${id}`)
  }

  // Create a new contact
  const createContact = async (contactData: OriginalContact) => {
    return await post<ContactResponse>('/contacts', {
      originalContact: contactData
    })
  }

  // Bulk create contacts - use postBulk for longer timeout
  const createBulkContacts = async (contacts: OriginalContact[]) => {
    return await postBulk<BulkCreateResponse>('/contacts/bulk', {
      contacts
    })
  }

  // Enhanced bulk create with dynamic field support
  const createEnhancedBulkContacts = async (request: EnhancedBulkCreateRequest) => {
    return await postBulk<EnhancedImportResult>('/contacts/bulk-enhanced', request)
  }

  // Enrich a single contact
  const enrichContact = async (id: string) => {
    return await post<ContactResponse>(`/contacts/${id}/enrich`)
  }

  // Bulk enrich contacts - use postBulk for longer timeout
  const enrichBulkContacts = async (contactIds: string[]) => {
    return await postBulk<EnrichBulkResponse>('/contacts/enrich-bulk', {
      contactIds
    })
  }

  // Get contact statistics
  const getContactStats = async () => {
    return await get<ContactStats>('/contacts/stats')
  }

  // Check API health
  const checkHealth = async () => {
    return await get<{ status: string; service: string }>('/health')
  }

  return {
    getContacts,
    getContact,
    createContact,
    createBulkContacts,
    createEnhancedBulkContacts,
    enrichContact,
    enrichBulkContacts,
    getContactStats,
    checkHealth
  }
} 
