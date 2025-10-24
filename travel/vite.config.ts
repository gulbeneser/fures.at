import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const sanitize = (value: string | undefined): string =>
  typeof value === 'string' ? value.trim() : '';

const geminiApiKey = sanitize(
  process.env.VITE_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY
);
const mapsApiKey = sanitize(
  process.env.VITE_MAPS_API_KEY ?? process.env.MAPS_API_KEY
);

const serializedGeminiKey = JSON.stringify(geminiApiKey);
const serializedMapsKey = JSON.stringify(mapsApiKey);

export default defineConfig({
  base: '/travel/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  define: {
    __FURES_TRAVEL_AI_COMPANION_API_KEY__: serializedGeminiKey,
    __FURES_TRAVEL_MAPS_API_KEY__: serializedMapsKey,
    'process.env': JSON.stringify({
      GEMINI_API_KEY: geminiApiKey,
      MAPS_API_KEY: mapsApiKey,
      VITE_GEMINI_API_KEY: geminiApiKey,
      VITE_MAPS_API_KEY: mapsApiKey,
    }),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
