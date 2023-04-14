import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target:
          command === "serve" ? "http://localhost:3133" : "http://localhost",
        changeOrigin: true,
      },
    },
  },
}));
