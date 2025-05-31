<template>
    <button @click="copyToClipboard"
        class="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors"
        :title="copied ? 'Copied!' : 'Copy to clipboard'">
        <Icon v-if="!copied" name="ph:copy" class="w-4 h-4" />
        <Icon v-else name="ph:check" class="w-4 h-4 text-green-400" />
    </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    text: string
}>()

const copied = ref(false)

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(props.text)
        copied.value = true

        // Reset copied state after 2 seconds
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy text: ', err)
    }
}
</script>