<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Import Contacts</h1>
      <p class="text-muted-foreground">
        Upload an Excel file to import contacts for enrichment. Supported formats: .xlsx, .xls
      </p>
    </div>

    <!-- Upload Section -->
    <Card v-if="!importData" class="p-6">
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Upload Excel File</h3>
        
        <!-- Drop Zone -->
        <div
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
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
        <div class="bg-muted/50 rounded-lg p-4">
          <h4 class="font-medium mb-2">Expected Format:</h4>
          <div class="text-sm space-y-1">
            <p><strong>Required columns:</strong> Name, Email</p>
            <p><strong>Optional columns:</strong> Phone, Company, Title</p>
            <p><strong>Recommended:</strong> Keep files under 5,000 contacts for optimal performance</p>
            <p><strong>Maximum:</strong> 10,000 contacts per import</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Preview Section -->
    <div v-if="importData && !importing" class="space-y-4">
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Import Preview</h3>
          <Button variant="outline" @click="resetImport">
            <RotateCcw class="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>

        <div class="space-y-4">
          <!-- Import Summary -->
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-muted/50 rounded-lg">
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

          <!-- Errors -->
          <div v-if="importData.errors.length > 0" class="space-y-2">
            <h4 class="font-medium text-destructive">Import Errors:</h4>
            <div class="bg-destructive/10 rounded-lg p-4 space-y-1">
              <p v-for="error in importData.errors" :key="error" class="text-sm text-destructive">
                • {{ error }}
              </p>
            </div>
          </div>

          <!-- Preview Table -->
          <div class="border rounded-lg overflow-hidden">
            <div class="bg-muted/50 px-4 py-2 border-b">
              <h4 class="font-medium">Contact Preview (First 5 rows)</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-muted/25">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium">Name</th>
                    <th class="px-4 py-2 text-left text-sm font-medium">Email</th>
                    <th class="px-4 py-2 text-left text-sm font-medium">Phone</th>
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

          <!-- Import Button -->
          <div class="flex justify-end">
            <Button 
              :disabled="importData.validRows === 0" 
              size="lg"
              @click="startImport"
            >
              <Users class="mr-2 h-4 w-4" />
              Import {{ importData.validRows }} Contacts
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Import Progress -->
    <Card v-if="importing" class="p-6">
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <Loader2 class="h-5 w-5 animate-spin" />
          <h3 class="text-lg font-semibold">Importing Contacts...</h3>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Progress</span>
            <span>{{ importProgress }}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${importProgress}%` }"
            />
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          Please wait while we import your contacts. This may take a few moments.
        </p>
      </div>
    </Card>

    <!-- Success Message -->
    <Card v-if="importCompleted" class="p-6 border-green-200 bg-green-50">
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <CheckCircle class="h-5 w-5 text-green-600" />
          <h3 class="text-lg font-semibold text-green-800">Import Completed!</h3>
        </div>
        
        <p class="text-green-700">
          Successfully imported {{ importData?.validRows }} contacts. You can now view and enrich them.
        </p>

        <div class="flex space-x-2">
          <Button @click="navigateTo('/contacts')">
            <Users class="mr-2 h-4 w-4" />
            View Contacts
          </Button>
          <Button variant="outline" @click="resetImport">
            Import More
          </Button>
        </div>
      </div>
    </Card>

    <!-- Error Message -->
    <Card v-if="importError" class="p-6 border-destructive bg-destructive/5">
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <AlertCircle class="h-5 w-5 text-destructive" />
          <h3 class="text-lg font-semibold text-destructive">Import Failed</h3>
        </div>
        
        <p class="text-destructive">
          {{ importError }}
        </p>

        <Button variant="outline" @click="resetImport">
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
  Loader2,
  RotateCcw,
  Upload,
  Users
} from 'lucide-vue-next'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import type { ImportResult, OriginalContact } from '~/types/contact'

// Apply authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { createBulkContacts } = useContacts()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const importData = ref<ImportResult | null>(null)
const importing = ref(false)
const importProgress = ref(0)
const importCompleted = ref(false)
const importError = ref('')

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

    const result = parseContactData(jsonData as any[][])
    importData.value = result
    importError.value = ''
  } catch (error) {
    console.error('Error processing file:', error)
    importError.value = 'Error processing file. Please try again.'
  }
}

const parseContactData = (data: any[][]): ImportResult => {
  const headers = data[0]?.map(h => h?.toString().toLowerCase()) || []
  const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
  
  // Check for maximum row limit
  const MAX_CONTACTS = 10000
  if (rows.length > MAX_CONTACTS) {
    return {
      success: false,
      totalRows: rows.length,
      validRows: 0,
      errors: [`File contains ${rows.length} contacts. Maximum allowed is ${MAX_CONTACTS} contacts per import. Please split your file into smaller batches.`],
      contacts: []
    }
  }
  
  const nameIndex = headers.findIndex(h => h?.includes('name'))
  const emailIndex = headers.findIndex(h => h?.includes('email'))
  const phoneIndex = headers.findIndex(h => h?.includes('phone'))
  
  const contacts: OriginalContact[] = []
  const errors: string[] = []
  
  if (nameIndex === -1) {
    errors.push('Name column is required')
  }
  
  if (emailIndex === -1) {
    errors.push('Email column is required')
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
    
    contacts.push({
      name: row[nameIndex]?.toString().trim() || '',
      email: email || '',
      phone: row[phoneIndex]?.toString().trim() || undefined
    })
  })
  
  // Show a warning for large files
  if (contacts.length > 5000) {
    errors.push(`Warning: Large file detected (${contacts.length} contacts). Import may take several minutes to complete.`)
  }
  
  return {
    success: errors.filter(e => !e.startsWith('Warning:')).length === 0,
    totalRows: rows.length,
    validRows: contacts.length,
    errors,
    contacts
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
    
    // Make API call to import contacts
    const response = await createBulkContacts(importData.value.contacts)
    
    // Complete progress
    clearInterval(progressInterval)
    importProgress.value = 100
    
    // Update import data with actual results
    if (response.totalErrors > 0) {
      importData.value.errors.push(...response.errors)
      importData.value.validRows = response.totalCreated
    }
    
    setTimeout(() => {
      importing.value = false
      importCompleted.value = true
    }, 500)
    
  } catch (error: any) {
    importing.value = false
    
    // Better error handling for timeout and other issues
    if (error.message?.includes('timeout') || error.message?.includes('deadline')) {
      importError.value = 'Import operation timed out. This usually happens with very large files. Please try with smaller batches (under 1000 contacts) or contact support.'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      importError.value = 'Network error occurred during import. Please check your connection and try again.'
    } else {
      importError.value = error.message || 'Failed to import contacts. Please try again.'
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
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script> 
 