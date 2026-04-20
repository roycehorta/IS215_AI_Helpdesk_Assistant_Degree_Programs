import tailwindcss from '@tailwindcss/vite'; // <--- ADD THIS LINE HERE
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Now this will work because it's defined above!
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://is215-openai.upou.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})