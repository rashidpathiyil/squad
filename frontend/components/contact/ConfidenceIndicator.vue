<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{{ label }}</span>
      <Badge :variant="badgeVariant">{{ score }}%</Badge>
    </div>
    
    <div class="w-full bg-muted rounded-full h-2">
      <div 
        :class="[
          'h-2 rounded-full transition-all duration-300',
          progressColorClass
        ]"
        :style="{ width: `${score}%` }"
      />
    </div>
    
    <div v-if="source" class="text-xs text-muted-foreground">
      Source: {{ source }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { getConfidenceLevel } from '~/lib/utils'


interface Props {
  score: number
  label: string
  source?: string
}

const props = defineProps<Props>()

const confidenceLevel = computed(() => getConfidenceLevel(props.score))

const badgeVariant = computed(() => {
  switch (confidenceLevel.value) {
    case 'low': return 'low'
    case 'medium': return 'medium'
    case 'high': return 'high'
    default: return 'secondary'
  }
})

const progressColorClass = computed(() => {
  switch (confidenceLevel.value) {
    case 'low': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'high': return 'bg-green-500'
    default: return 'bg-muted-foreground'
  }
})
</script> 
