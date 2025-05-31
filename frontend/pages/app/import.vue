<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Import Contacts</h1>
      <p class="text-muted-foreground">
        Upload an Excel file to import contacts for enrichment. Supported formats: .xlsx, .xls
      </p>
    </div>

    <!-- Upload Section -->
    <Card v-if="!importData" class="px-0">
      <CardHeader>
        <CardTitle>Upload Excel File</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Drop Zone -->
        <div
          :class="[
            'border border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          ]"
          @drop="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @click="fileInput?.click()"
        >
          <Upload class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div class="space-y-2">
            <p class="text-lg font-medium">Drop your Excel file here</p>
            <p class="text-sm text-muted-foreground">or click to browse files</p>
            <p class="text-xs text-muted-foreground">Supports .xlsx and .xls files</p>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".xlsx,.xls"
          @change="onFileSelect"
        >

        <!-- Sample Format -->
        <div class="bg-muted/30 rounded-lg p-4">
          <h4 class="font-medium mb-2">Expected Format:</h4>
          <div class="text-sm space-y-1 text-muted-foreground">
            <p><strong>Required columns:</strong> Name, Email</p>
            <p><strong>Optional columns:</strong> Phone, Company, Title</p>
            <p><strong>Recommended:</strong> Keep files under 5,000 contacts for optimal performance</p>
            <p><strong>Maximum:</strong> 10,000 contacts per import</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Preview Section -->
    <div v-if="importData && !importing" class="space-y-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Import Preview</CardTitle>
          <Button variant="outline" size="sm" @click="resetImport">
            <RotateCcw class="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Import Summary -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-muted/30 rounded-lg">
              <div class="text-2xl font-bold">{{ importData.totalRows }}</div>
              <div class="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div class="text-center p-4 bg-green-50 text-green-800 rounded-lg">
              <div class="text-2xl font-bold">{{ importData.validRows }}</div>
              <div class="text-sm">Valid Contacts</div>
            </div>
            <div class="text-center p-4 bg-red-50 text-red-800 rounded-lg">
              <div class="text-2xl font-bold">{{ importData.errors.length }}</div>
              <div class="text-sm">Errors</div>
            </div>
          </div>

          <!-- Preview Table -->
          <div class="border rounded-lg overflow-hidden">
            <div class="bg-muted/30 px-4 py-2 border-b">
              <h4 class="font-medium">Contact Preview (First 5 rows)</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-muted/20">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(contact, index) in importData.contacts.slice(0, 5)" :key="index" class="border-t">
                    <td class="px-4 py-2 text-sm">{{ contact.name }}</td>
                    <td class="px-4 py-2 text-sm">{{ contact.email }}</td>
                    <td class="px-4 py-2 text-sm">{{ contact.phone || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Errors -->
          <div v-if="importData.errors.length > 0" class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-destructive">Import Errors ({{ importData.errors.length }})</h4>
              <Button 
                v-if="importData.errors.length > 3" 
                variant="outline" 
                size="sm"
                @click="errorSheetOpen = true"
              >
                <AlertCircle class="mr-2 h-4 w-4" />
                View All Errors
              </Button>
            </div>
            <div class="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <div class="space-y-2">
                <div 
                  v-for="(error, index) in importData.errors.slice(0, 3)" 
                  :key="`error-${index}`" 
                  class="flex items-start space-x-2 text-sm text-destructive"
                >
                  <span class="flex-shrink-0 mt-0.5">•</span>
                  <span class="break-words">{{ error }}</span>
                </div>
                <div v-if="importData.errors.length > 3" class="pt-2 border-t border-destructive/20">
                  <p class="text-xs text-destructive/70 text-center">
                    And {{ importData.errors.length - 3 }} more errors...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter v-if="!importCompleted" class="flex justify-end">
          <Button 
            :disabled="importData.validRows === 0 || importing" 
            size="default"
            @click="startImport"
          >
            <Users class="mr-2 h-4 w-4" />
            Import {{ importData.validRows }} Contacts
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- Import Progress -->
    <Card v-if="importing">
      <CardContent class="space-y-4">
        <div class="flex items-center space-x-2">
          <Loader2 class="h-5 w-5 animate-spin" />
          <CardTitle>Importing Contacts...</CardTitle>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Progress</span>
            <span>{{ importProgress }}%</span>
          </div>
          <div class="w-full bg-muted/30 rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${importProgress}%` }"
            />
          </div>
        </div>

        <CardDescription>
          Please wait while we import your contacts. This may take a few moments.
        </CardDescription>
      </CardContent>
    </Card>

    <!-- Success Message -->
    <Card v-if="importCompleted" class="bg-green-50">
      <CardContent class="space-y-4">
        <div class="flex items-center space-x-2">
          <CheckCircle class="h-5 w-5 text-green-600" />
          <CardTitle class="text-green-800">Import Completed!</CardTitle>
        </div>
        
        <div class="space-y-2">
          <CardDescription class="text-green-700">
            <span v-if="lastImportResult?.processedContacts && lastImportResult.processedContacts > 0">
              Successfully imported {{ lastImportResult.processedContacts }} contacts.
            </span>
            <span v-else-if="lastImportResult?.skippedContacts && lastImportResult.skippedContacts > 0">
              Import completed but all {{ lastImportResult.skippedContacts }} contacts were skipped.
            </span>
            <span v-else>
              Import process completed.
            </span>
          </CardDescription>

          <!-- Field Summary Stats -->
          <div v-if="lastImportResult?.fieldSummary" class="bg-white/60 rounded-lg p-3 mt-3">
            <h4 class="font-medium text-green-800 mb-2">Field Processing Summary</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex justify-between">
                <span>Total Fields:</span>
                <span class="font-medium">{{ lastImportResult.fieldSummary.detectedFields?.length || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Standard Fields:</span>
                <span class="font-medium text-green-600">{{ lastImportResult.fieldSummary.standardFields?.length || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Custom Fields:</span>
                <span class="font-medium text-orange-600">{{ lastImportResult.fieldSummary.customFields?.length || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Total Processed:</span>
                <span class="font-medium">{{ lastImportResult.fieldSummary.totalContacts || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Errors Summary -->
          <div v-if="lastImportResult?.totalErrors && lastImportResult.totalErrors > 0" class="bg-orange-50 rounded-lg p-3 mt-3">
            <h4 class="font-medium text-orange-800 mb-2">Issues Found</h4>
            <div class="text-sm text-orange-700">
              {{ lastImportResult.totalErrors }} contacts were skipped due to validation errors or duplicates.
            </div>
          </div>
        </div>

        <div class="flex space-x-2">
          <Button @click="navigateTo('/app/contacts')">
            <Users class="mr-2 h-4 w-4" />
            View Contacts
          </Button>
          <Button 
            v-if="lastImportResult?.fieldSummary" 
            variant="outline" 
            @click="showFieldSummary = true"
          >
            📋 View Field Details
          </Button>
          <Button variant="outline" @click="resetImport">
            Import More
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Error Message -->
    <Card v-if="importError" class="bg-destructive/5">
      <CardContent class="space-y-4">
        <div class="flex items-center space-x-2">
          <AlertCircle class="h-5 w-5 text-destructive" />
          <CardTitle class="text-destructive">Import Failed</CardTitle>
        </div>
        
        <CardDescription class="text-destructive">
          {{ importError }}
        </CardDescription>

        <Button variant="outline" @click="resetImport">
          Try Again
        </Button>
      </CardContent>
    </Card>

    <!-- Error Sheet -->
    <Sheet v-model:open="errorSheetOpen">
      <SheetContent class="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Import Errors ({{ importData?.errors.length || 0 }})</SheetTitle>
          <SheetDescription>
            Review all errors found during the import process.
          </SheetDescription>
        </SheetHeader>
        <div class="mt-6 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div 
            v-for="(error, index) in importData?.errors || []" 
            :key="`sheet-error-${index}`" 
            class="flex items-start space-x-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20"
          >
            <AlertCircle class="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <span class="text-sm text-destructive break-words leading-relaxed">{{ error }}</span>
          </div>
        </div>
        <SheetFooter class="mt-6">
          <Button variant="outline" class="w-full" @click="errorSheetOpen = false">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- Field Summary Dialog -->
    <FieldSummaryDialog
      v-if="lastImportResult?.fieldSummary"
      :is-open="showFieldSummary"
      :field-summary="lastImportResult.fieldSummary"
      @close="showFieldSummary = false"
      @view-contacts="navigateTo('/app/contacts')"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Upload,
  Users
} from 'lucide-vue-next'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import FieldSummaryDialog from '~/components/FieldSummaryDialog.vue'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '~/components/ui/sheet'
import type { EnhancedImportResult, ImportResult } from '~/types/contact'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { createEnhancedBulkContacts } = useContacts()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const importData = ref<ImportResult | null>(null)
const importing = ref(false)
const importProgress = ref(0)
const importCompleted = ref(false)
const importError = ref('')
const errorSheetOpen = ref(false)
const showFieldSummary = ref(false)
const lastImportResult = ref<EnhancedImportResult | null>(null)

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

const processFile = async (file: File) => {
  if (!file.name.match(/\.(xlsx|xls)$/)) {
    alert('Please select a valid Excel file (.xlsx or .xls)')
    return
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    const result = parseContactData(jsonData as unknown[][])
    importData.value = result
    importError.value = ''
  } catch (error) {
    console.error('Error processing file:', error)
    importError.value = 'Error processing file. Please try again.'
  }
}

const parseContactData = (data: unknown[][]): ImportResult => {
  // Filter out undefined/null headers and convert to strings
  const rawHeaders = data[0] || []
  const headers: string[] = rawHeaders
    .map(h => h?.toString().toLowerCase().trim())
    .filter((h): h is string => Boolean(h && h.length > 0))
  
  const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
  
  // Check for maximum row limit
  const MAX_CONTACTS = 10000
  if (rows.length > MAX_CONTACTS) {
    return {
      success: false,
      totalRows: rows.length,
      validRows: 0,
      errors: [`File contains ${rows.length} contacts. Maximum allowed is ${MAX_CONTACTS} contacts per import. Please split your file into smaller batches.`],
      contacts: [],
      detectedFields: headers,
      fieldMappings: {}
    }
  }
  
  // Find required field indices
  const nameIndex = headers.findIndex(h => 
    h.includes('name') || h.includes('full name') || h.includes('fullname')
  )
  const emailIndex = headers.findIndex(h => 
    h.includes('email') || h.includes('e-mail') || h.includes('email address')
  )
  
  const contactsData: Record<string, unknown>[] = []
  const errors: string[] = []
  
  if (nameIndex === -1) {
    errors.push('Name column is required (columns like "name", "full name", "fullname" are accepted)')
  }
  
  if (emailIndex === -1) {
    errors.push('Email column is required (columns like "email", "e-mail", "email address" are accepted)')
  }
  
  if (nameIndex === -1 || emailIndex === -1) {
    return {
      success: false,
      totalRows: rows.length,
      validRows: 0,
      errors,
      contacts: [],
      detectedFields: headers,
      fieldMappings: {}
    }
  }
  
  const emailSet = new Set<string>()
  
  rows.forEach((row, index) => {
    const rowNumber = index + 2 // Account for header row
    
    if (!row[nameIndex] || !row[emailIndex]) {
      if (!row[nameIndex] && !row[emailIndex]) {
        // Skip empty rows
        return
      }
      errors.push(`Row ${rowNumber}: Missing name or email`)
      return
    }
    
    const email = row[emailIndex]?.toString().trim().toLowerCase()
    if (!isValidEmail(email)) {
      errors.push(`Row ${rowNumber}: Invalid email format`)
      return
    }
    
    if (emailSet.has(email)) {
      errors.push(`Row ${rowNumber}: Duplicate email ${email}`)
      return
    }
    
    emailSet.add(email)
    
    // Extract all fields dynamically
    const contactData: Record<string, unknown> = {}
    headers.forEach((header, index) => {
      if (header && row[index] !== null && row[index] !== undefined && row[index] !== '') {
        contactData[header] = row[index]?.toString().trim()
      }
    })
    
    contactsData.push(contactData)
  })
  
  // Create field mappings for display
  const fieldMappings: Record<string, string> = {}
  headers.forEach(header => {
    fieldMappings[header] = header // Keep original for now, will be normalized on backend
  })
  
  // Show a warning for large files
  if (contactsData.length > 5000) {
    errors.push(`Warning: Large file detected (${contactsData.length} contacts). Import may take several minutes to complete.`)
  }
  
  return {
    success: errors.filter(e => !e.startsWith('Warning:')).length === 0,
    totalRows: rows.length,
    validRows: contactsData.length,
    errors,
    contacts: contactsData,
    detectedFields: headers,
    fieldMappings
  }
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const startImport = async () => {
  if (!importData.value || importData.value.contacts.length === 0) return
  
  importing.value = true
  importProgress.value = 0
  importError.value = ''
  
  try {
    // More realistic progress animation for bulk operations
    const progressInterval = setInterval(() => {
      if (importProgress.value < 80) {
        importProgress.value += Math.random() * 5 + 2 // Random increment between 2-7%
      }
    }, 1000) // Update every second
    
    // Use enhanced bulk import API with dynamic fields
    const response = await createEnhancedBulkContacts({
      contacts: importData.value.contacts as Record<string, unknown>[],
      fieldMapping: importData.value.fieldMappings
    })
    
    // Store the response for UI display
    lastImportResult.value = response
    
    // Complete progress
    clearInterval(progressInterval)
    importProgress.value = 100
    
    // Show success
    importCompleted.value = true
    importError.value = ''
    
    setTimeout(() => {
      importing.value = false
    }, 500)
    
  } catch (error) {
    importing.value = false
    
    // Better error handling for different error types
    if (error instanceof Error) {
      if (error.message?.includes('timeout') || error.message?.includes('deadline')) {
        importError.value = 'Import operation timed out. This usually happens with very large files. Please try with smaller batches (under 1000 contacts) or contact support.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        importError.value = 'Network error occurred during import. Please check your connection and try again.'
      } else if (error.message?.includes('bulk-enhanced')) {
        importError.value = 'Enhanced import is not available. Please try again or contact support.'
      } else {
        importError.value = error.message || 'Failed to import contacts. Please try again.'
      }
    } else {
      importError.value = 'An unexpected error occurred during import. Please try again.'
    }
    
    console.error('Import failed:', error)
  }
}

const resetImport = () => {
  importData.value = null
  importing.value = false
  importProgress.value = 0
  importCompleted.value = false
  importError.value = ''
  errorSheetOpen.value = false
  showFieldSummary.value = false
  lastImportResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script> 
 