import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Repo is served from https://<user>.github.io/Zoey-Kleiderschrank/
const base = "/Zoey-Kleiderschrank/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        id: base,
        name: "Zoeys Kleiderschrank",
        short_name: "Kleiderschrank",
        description: "Digitaler Kleiderschrank zum Fotografieren, Freistellen und Outfits zusammenstellen.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#fdf2f8",
        theme_color: "#db2777",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
});
