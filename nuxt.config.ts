// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt', '@formkit/auto-animate/nuxt'],
  css: ['~/assets/style.css'],

  imports: {
      dirs: ['types/**'],
  },

  compatibilityDate: '2025-03-16',
})