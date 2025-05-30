import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    'nuxt-auth-utils',
    'shadcn-nuxt',
    'nuxt-icon',
  ],
  colorMode: {
    classSuffix: ''
  },
  css: ['~/assets/css/tailwind.css'],
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },
  runtimeConfig: {
    // Private keys (only available on the server-side)
    session: {
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
    // Public keys (exposed to the client-side)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api/v1'
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    experimental: {
      wasm: true
    }
  },
  ssr: true
}) 
 