import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Standard Service Worker registration for 100% PWA installability in Chrome & Mobile browsers
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[PWA] Service Worker registrado exitosamente. Scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Advertencia registrando Service Worker nativo:', err);
      });
  });
}

// Register virtual PWA plugin worker as companion
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
  console.warn('[PWA] Registro de virtual Service Worker omitido:', e);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
