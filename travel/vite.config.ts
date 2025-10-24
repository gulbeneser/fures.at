import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const pickKey = (...keys: string[]) => {
      for (const key of keys) {
        const value = env[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }
      return '';
    };

    const geminiApiKey = pickKey(
      'GEMINI_API_KEY',
      'API_KEY',
      'VITE_GEMINI_API_KEY',
      'VITE_API_KEY',
      'GEMINI_KEY',
      'GEMINIAPIKEY',
      'GEMINIKEY',
      'GOOGLE_API_KEY',
      'GOOGLEAI_API_KEY',
      'FURES_TRAVEL_GEMINI_API_KEY',
      'FURES_GEMINI_API_KEY',
      'apikey'
    );

    const mapsApiKey = pickKey(
      'MAPS_API_KEY',
      'VITE_MAPS_API_KEY',
      'GOOGLE_MAPS_API_KEY',
      'VITE_GOOGLE_MAPS_API_KEY',
      'GOOGLE_MAPS_KEY',
      'MAPS_KEY',
      'MAPSAPIKEY'
    );

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
        __FURES_TRAVEL_AI_COMPANION_API_KEY__: serializedGeminiKey,
        __FURES_TRAVEL_MAPS_API_KEY__: serializedMapsKey,
        'process.env.API_KEY': serializedGeminiKey,
        'process.env.GEMINI_API_KEY': serializedGeminiKey,
        'process.env.VITE_API_KEY': serializedGeminiKey,
        'process.env.VITE_GEMINI_API_KEY': serializedGeminiKey,
        'process.env.GOOGLE_API_KEY': serializedGeminiKey,
        'import.meta.env.GEMINI_API_KEY': serializedGeminiKey,
        'import.meta.env.VITE_GEMINI_API_KEY': serializedGeminiKey,
        'import.meta.env.VITE_API_KEY': serializedGeminiKey,
        'process.env.MAPS_API_KEY': serializedMapsKey,
        'process.env.VITE_MAPS_API_KEY': serializedMapsKey,
        'process.env.VITE_GOOGLE_MAPS_API_KEY': serializedMapsKey,
        'process.env.GOOGLE_MAPS_API_KEY': serializedMapsKey,
        'import.meta.env.MAPS_API_KEY': serializedMapsKey,
        'import.meta.env.VITE_MAPS_API_KEY': serializedMapsKey,
        'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': serializedMapsKey
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
