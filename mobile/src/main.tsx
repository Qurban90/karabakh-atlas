import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './theme/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Installable PWA: register the service worker for production builds only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline shell is progressive enhancement — the app works without it */
    });

  // Waiting for `load` unconditionally is a trap: a cached module can execute
  // after that event has already fired, and the listener would then never run,
  // leaving the app permanently without its offline shell.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
