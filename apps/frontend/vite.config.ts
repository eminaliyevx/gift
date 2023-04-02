import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
      },
      "/user-images": {
        target: "http://localhost",
        changeOrigin: true,
      },
      "/product-images": {
        target: "http://localhost",
        changeOrigin: true,
      },
    },
  },
});
