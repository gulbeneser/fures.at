import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const geminiKey =
    fileEnv.apikey ??
    fileEnv.API_KEY ??
    fileEnv.GEMINI_API_KEY ??
    process.env.apikey ??
    process.env.API_KEY ??
    process.env.GEMINI_API_KEY ??
    "";

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    build: {
      outDir: "dist",
      sourcemap: true
    }
  };
});
