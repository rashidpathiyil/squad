<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <Icon name="carbon:api" class="w-8 h-8 text-blue-400" />
          <span class="text-xl font-bold">CEA</span>
        </NuxtLink>
        <div class="flex items-center space-x-6">
          <NuxtLink to="/docs" class="text-gray-300 hover:text-white transition-colors">Documentation</NuxtLink>
          <!-- Show different buttons based on current route -->
          <NuxtLink 
            v-if="$route.path === '/auth/login'" 
            to="/auth/register" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Sign Up
          </NuxtLink>
          <NuxtLink 
            v-else-if="$route.path === '/auth/register'" 
            to="/auth/login" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Sign In
          </NuxtLink>
          <NuxtLink 
            v-else 
            to="/auth/register" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main content with padding to account for fixed nav -->
    <div class="pt-20">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">

</script> 
