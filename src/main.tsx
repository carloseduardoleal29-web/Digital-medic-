import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for instant PWA load and offline caching with safe fallback
try {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA] Nueva versión disponible');
    },
    onOfflineReady() {
      console.log('[PWA] Aplicación lista para funcionar sin conexión');
    },
    onRegisterError(error) {
      console.warn('[PWA] Error al registrar Service Worker (ignorado):', error);
    }
  });
} catch (e) {
  console.warn('[PWA] Registro de Service Worker omitido:', e);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
