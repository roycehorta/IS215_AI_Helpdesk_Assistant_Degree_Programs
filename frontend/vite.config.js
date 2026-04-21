import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://l7ya1t9a3g.execute-api.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            "/default/upou-advisor-middleware-test-by-jed",
          ),
      },
    },
  },
});
