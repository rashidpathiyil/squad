export interface OriginalContact {
  name: string
  email: string
  phone?: string
  
  // Additional standard fields
  company?: string
  title?: string
  industry?: string
  location?: string
  department?: string
  
  // Dynamic/custom fields
  customFields?: Record<string, any>
}

export interface EnrichedContact {
  name: string
  email: string
  title?: string
  company?: string
  location?: string
  bio?: string
  skills?: string[]
  socialProfiles?: {
    linkedin?: string
    github?: string
    twitter?: string
    facebook?: string
  }
}

export interface ConfidenceScores {
  name: number
  email: number
  title?: number
  company?: number
  location?: number
  bio?: number
  skills?: number
  socialProfiles?: {
    linkedin?: number
    github?: number
    twitter?: number
    facebook?: number
  }
}

export interface Sources {
  [key: string]: string
}

export interface EnrichmentSummary {
  fieldsEnriched: string[]
  fieldsNotFound: string[]
  overallConfidence: number
}

export interface Contact {
  _id: string
  originalContact: OriginalContact
  enrichedContact?: EnrichedContact
  confidenceScores?: ConfidenceScores
  sources?: Sources
  enrichmentSummary?: EnrichmentSummary
  status: 'imported' | 'processing' | 'enriched' | 'failed'
  created_at: Date
  updated_at: Date
  enriched_at?: Date
}

export interface ImportResult {
  success: boolean
  totalRows: number
  validRows: number
  errors: string[]
  contacts: OriginalContact[] | Record<string, unknown>[]
  detectedFields?: string[]
  fieldMappings?: Record<string, string>
}

export interface EnrichmentJob {
  id: string
  contactIds: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt: Date
  completedAt?: Date
  results?: {
    success: number
    failed: number
    errors: string[]
  }
}

export interface ExportOptions {
  format: 'csv' | 'excel'
  includeOriginal: boolean
  includeEnriched: boolean
  includeConfidenceScores: boolean
  includeSources: boolean
  contactIds?: string[]
  filters?: {
    status?: Contact['status'][]
    minConfidence?: number
    maxConfidence?: number
    dateRange?: {
      start: Date
      end: Date
    }
  }
}

export interface DashboardStats {
  totalContacts: number
  enrichedContacts: number
  pendingEnrichment: number
  averageConfidence: number
  recentActivity: {
    imported: number
    enriched: number
    exported: number
  }
}

// Enhanced import types
export interface FieldSummary {
  detectedFields: string[]
  standardFields: string[]
  customFields: string[]
  fieldMappings: Record<string, string>
  totalContacts: number
  processedContacts: number
}

export interface EnhancedImportResult {
  success: boolean
  processedContacts: number
  skippedContacts: number
  totalErrors: number
  fieldSummary: FieldSummary
  contacts: Contact[]
  errors: string[]
}

export interface EnhancedBulkCreateRequest {
  contacts: Record<string, any>[]
  fieldMapping?: Record<string, string>
} 
