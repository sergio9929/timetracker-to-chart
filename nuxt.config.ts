// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@vueuse/nuxt', '@formkit/auto-animate/nuxt'],
    css: ['~/assets/style.css'],
    imports: {
        dirs: ['types/*.ts'],
    },
})
