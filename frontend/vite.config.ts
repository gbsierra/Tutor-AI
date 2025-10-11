
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // directly map @shared to the folder
      "@shared": path.resolve(__dirname, "../shared"),
      // map @local/shared to the shared index file
      "@local/shared": path.resolve(__dirname, "../shared/index.js"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // Forward all /api/* requests to backend
      },
    },
  },
});
