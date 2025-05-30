<template>
  <Sheet :open="isOpen" @update:open="handleOpenChange">
    <SheetContent class="max-w-2xl sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Import Field Summary</SheetTitle>
        <SheetDescription>
          Review how your fields were processed during import
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 mt-6">
        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-lg font-bold text-blue-800">{{ fieldSummary.totalContacts }}</div>
            <div class="text-sm text-blue-600">Total Contacts</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-lg font-bold text-green-800">{{ fieldSummary.processedContacts }}</div>
            <div class="text-sm text-green-600">Processed</div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-lg font-bold text-purple-800">{{ fieldSummary.standardFields?.length || 0 }}</div>
            <div class="text-sm text-purple-600">Standard Fields</div>
          </div>
          <div class="text-center p-3 bg-orange-50 rounded-lg">
            <div class="text-lg font-bold text-orange-800">{{ fieldSummary.customFields?.length || 0 }}</div>
            <div class="text-sm text-orange-600">Custom Fields</div>
          </div>
        </div>

        <!-- Field Mappings -->
        <div class="space-y-4">
          <!-- Standard Fields -->
          <div v-if="standardFieldMappings.length > 0">
            <h4 class="font-medium text-green-800 mb-2 flex items-center">
              <Badge variant="outline" class="mr-2 bg-green-50">
                Standard Fields ({{ standardFieldMappings.length }})
              </Badge>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="mapping in standardFieldMappings"
                :key="mapping.original"
                class="flex items-center justify-between p-2 bg-green-50 rounded border"
              >
                <span class="text-sm font-medium">{{ mapping.original }}</span>
                <span class="text-xs text-muted-foreground">→</span>
                <span class="text-sm text-green-700">{{ mapping.mapped }}</span>
              </div>
            </div>
          </div>

          <!-- Custom Fields -->
          <div v-if="customFieldMappings.length > 0">
            <h4 class="font-medium text-orange-800 mb-2 flex items-center">
              <Badge variant="outline" class="mr-2 bg-orange-50">
                Custom Fields ({{ customFieldMappings.length }})
              </Badge>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div
                v-for="mapping in customFieldMappings"
                :key="mapping.original"
                class="flex items-center justify-between p-2 bg-orange-50 rounded border"
              >
                <span class="text-sm font-medium">{{ mapping.original }}</span>
                <span class="text-xs text-muted-foreground">→</span>
                <span class="text-sm text-orange-700">custom field</span>
              </div>
            </div>
          </div>

          <!-- Field Detection Info -->
          <div class="bg-muted/30 rounded-lg p-4">
            <h4 class="font-medium mb-2">Field Detection Details</h4>
            <div class="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Standard fields</strong> are automatically mapped to known contact properties</p>
              <p>• <strong>Custom fields</strong> are preserved exactly as they appear in your file</p>
              <p>• All data is searchable and can be used for enrichment</p>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="mt-6">
        <Button variant="outline" @click="$emit('close')">Close</Button>
        <Button @click="$emit('viewContacts')">View Imported Contacts</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '~/components/ui/sheet'
import type { FieldSummary } from '~/types/contact'

interface Props {
  isOpen: boolean
  fieldSummary: FieldSummary
}

interface FieldMapping {
  original: string
  mapped: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  viewContacts: []
}>()

const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('close')
  }
}

const standardFieldMappings = computed((): FieldMapping[] => {
  if (!props.fieldSummary.standardFields || !props.fieldSummary.fieldMappings) {
    return []
  }
  
  return props.fieldSummary.standardFields.map(field => ({
    original: field,
    mapped: props.fieldSummary.fieldMappings[field] || field
  }))
})

const customFieldMappings = computed((): FieldMapping[] => {
  if (!props.fieldSummary.customFields || !props.fieldSummary.fieldMappings) {
    return []
  }
  
  return props.fieldSummary.customFields.map(field => ({
    original: field,
    mapped: props.fieldSummary.fieldMappings[field] || field
  }))
})
</script> 
