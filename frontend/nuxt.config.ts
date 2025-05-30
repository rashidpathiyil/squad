// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    'nuxt-auth-utils'
  ],
  colorMode: {
    classSuffix: ''
  },
  css: ['~/assets/css/main.css'],
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
  nitro: {
    experimental: {
      wasm: true
    }
  },
  ssr: true
}) 
 