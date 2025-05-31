<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Icon name="carbon:api" class="w-8 h-8 text-blue-400" />
          <NuxtLink to="/" class="text-xl font-bold text-white hover:text-blue-400 transition-colors">LeadUp</NuxtLink>
        </div>
        <div class="flex items-center space-x-6">
          <NuxtLink to="/documentation" class="text-gray-300 hover:text-white transition-colors">Documentation
          </NuxtLink>
          <NuxtLink to="/auth/register" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Get
            Started</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="pt-20">
      <slot />
    </main>
  </div>
</template>

<script setup>
// Layout script if needed
</script>

<style scoped>
/* Layout-specific styles */
</style>
