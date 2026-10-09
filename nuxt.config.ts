import tailwindcss from "@tailwindcss/vite";

const SITE_URL = process.env.SITE_URL || "https://world.foodprint.com.ng";
const TITLE = "Foodprint World: walk Awka, order from a kitchen, watch your rider arrive";
const DESCRIPTION =
  "A playable 3D Awka. Walk the streets, step into real local kitchens, place an order and watch a Foodprint rider bring it to your door.";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "nuxt-lucide-icons",
  ],

  app: {
    head: {
      title: TITLE,
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
        },
        { name: "description", content: DESCRIPTION },
        { name: "theme-color", content: "#fb6b05" },
        { name: "author", content: "Foodprint" },
        { property: "og:site_name", content: "Foodprint World" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: SITE_URL },
        { property: "og:image", content: `${SITE_URL}/og.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: `${SITE_URL}/og.png` },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/brand/fp-mark.png" },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/Fredoka-Regular.woff2",
          crossorigin: "anonymous",
        },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/Fredoka-SemiBold.woff2",
          crossorigin: "anonymous",
        },
      ],
    },
  },

  fonts: {
    families: [
      { name: "Fredoka", src: "/fonts/Fredoka-Regular.woff2", weight: 400, global: true },
      { name: "Fredoka", src: "/fonts/Fredoka-Medium.woff2", weight: 500, global: true },
      { name: "Fredoka", src: "/fonts/Fredoka-SemiBold.woff2", weight: 600, global: true },
      { name: "Fredoka", src: "/fonts/Fredoka-Bold.woff2", weight: 700, global: true },
    ],
  },

  devServer: {
    port: 3003,
    host: "0.0.0.0",
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@tanstack/vue-query", "@vueuse/core", "three"],
    },
  },

  routeRules: {
    // Kenney GLBs never change once committed; let the browser keep them.
    "/models/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
    },
  },

  image: {
    quality: 80,
    format: ["webp", "jpg"],
  },

  typescript: {
    typeCheck: true,
  },
  components: true,
  css: ["~/assets/css/main.css"],
});
