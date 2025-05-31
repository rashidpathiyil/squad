<template>
  <div class="min-h-screen bg-background">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
      <div class="flex h-16 items-center border-b px-6">
        <NuxtLink to="/app" class="text-xl font-bold">LeadUp</NuxtLink>
      </div>

      <nav class="flex-1 space-y-1 p-4">
        <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href" :class="[
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          $route.path === item.href
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        ]">
          <component :is="item.icon" class="mr-3 h-5 w-5" />
          {{ item.name }}
        </NuxtLink>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex h-16 items-center justify-between px-6">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <Button variant="ghost" size="icon" @click="toggleColorMode">
              <Sun v-if="$colorMode.value === 'dark'" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </Button>

            <!-- User Menu -->
            <AuthState>
              <template #default="{ loggedIn, user, clear }">
                <div v-if="loggedIn" class="relative">
                  <Button variant="ghost" class="flex items-center space-x-2" @click="showUserMenu = !showUserMenu">
                    <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-foreground">
                        {{ user?.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                      </span>
                    </div>
                    <span class="text-sm font-medium">{{ user?.user?.name }}</span>
                    <ChevronDown class="h-4 w-4" />
                  </Button>

                  <!-- Dropdown Menu -->
                  <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-50">
                    <div class="py-1">
                      <div class="px-4 py-2 text-sm text-muted-foreground border-b">
                        {{ user?.user?.email }}
                      </div>
                      <button
                        class="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                        @click="handleLogout(clear)">
                        <LogOut class="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <NuxtLink to="/auth/login">
                    <Button variant="default" size="sm">
                      Sign In
                    </Button>
                  </NuxtLink>
                </div>
              </template>
              <template #placeholder>
                <div class="h-8 w-20 bg-accent rounded animate-pulse" />
              </template>
            </AuthState>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronDown,
  Download,
  Home,
  LogOut,
  Moon,
  Sun,
  Upload,
  Users
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const { $colorMode } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const showUserMenu = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/app', icon: Home },
  { name: 'Import Contacts', href: '/app/import', icon: Upload },
  { name: 'All Contacts', href: '/app/contacts', icon: Users },
  { name: 'Export', href: '/app/export', icon: Download },
]

const pageTitle = computed(() => {
  const currentRoute = navigation.find(item => item.href === route.path)
  return currentRoute?.name || 'LeadUp'
})

const toggleColorMode = () => {
  $colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleLogout = async (clearFn: () => void) => {
  try {
    await clearFn()
    showUserMenu.value = false
    await router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target?.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>