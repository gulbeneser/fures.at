
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

declare const __FURKAN_GEMINI_API_KEY__: string | null | undefined;

declare global {
  interface Window {
    __FURKAN_GEMINI_API_KEY__?: string | null;
  }
}

if (typeof window !== 'undefined') {
  const envKey =
    (typeof __FURKAN_GEMINI_API_KEY__ === 'string' && __FURKAN_GEMINI_API_KEY__.trim())
      ? __FURKAN_GEMINI_API_KEY__
      : undefined;

  if (envKey) {
    window.__FURKAN_GEMINI_API_KEY__ = envKey;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
