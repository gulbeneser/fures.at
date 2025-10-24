import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const sanitize = (value: string | undefined): string =>
  typeof value === 'string' ? value.trim() : '';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const geminiApiKey = sanitize(
    env.VITE_GEMINI_API_KEY ?? env.GEMINI_API_KEY
  );
  const mapsApiKey = sanitize(env.VITE_MAPS_API_KEY ?? env.MAPS_API_KEY);

  const serializedGeminiKey = JSON.stringify(geminiApiKey);
  const serializedMapsKey = JSON.stringify(mapsApiKey);

  return {
    base: '/travel/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': serializedGeminiKey,
      'process.env.MAPS_API_KEY': serializedMapsKey,
      'import.meta.env.VITE_GEMINI_API_KEY': serializedGeminiKey,
      'import.meta.env.VITE_MAPS_API_KEY': serializedMapsKey,
      __FURES_TRAVEL_AI_COMPANION_API_KEY__: serializedGeminiKey,
      __FURES_TRAVEL_MAPS_API_KEY__: serializedMapsKey,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
