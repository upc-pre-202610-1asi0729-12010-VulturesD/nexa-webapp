import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const renderApiOrigin = 'https://nexa-platform-api.onrender.com';

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    {
      name: 'nexa-production-origin-sanitizer',
      apply: 'build',
      generateBundle(_, bundle) {
        for (const asset of Object.values(bundle)) {
          if (asset.type === 'chunk') {
            asset.code = asset.code.replaceAll('http://localhost', renderApiOrigin);
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5173, open: true },
});
