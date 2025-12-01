import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Note: import 'virtual:pwa-register' dynamically in production only

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

// Register the service worker for PWA auto-updates only in production builds.
// During development the service worker can interfere with Vite's dev server
// (cached assets / fetch interception) and cause a white screen. So skip
// registration when not running in production.
let updateSW: any = null;
if (import.meta.env.PROD) {
  // dynamic import avoids module resolution errors during development
  // dynamic import avoids module resolution errors during development
  // @ts-ignore: virtual:pwa-register is provided by vite-plugin-pwa at build-time
  import('virtual:pwa-register')
    .then(({ registerSW }: any) => {
      updateSW = registerSW({
        onRegistered(r) {
          console.log('Service worker registered:', r);
        },
        onNeedRefresh() {
          console.log('New content available, please refresh.');
        },
        onOfflineReady() {
          console.log('App is ready to work offline.');
        }
      });
    })
    .catch(err => {
      console.warn('Failed to load virtual:pwa-register:', err);
    });
} else {
  console.log('Dev mode — service worker registration skipped');
  // If a previous service worker was installed (from a prior production run),
  // it can still control the page and intercept requests. During development
  // we proactively unregister any existing service workers and clear caches
  // so Vite's dev server isn't interfered with.
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => {
        if (regs.length) console.log('Found existing service worker registrations, unregistering...');
        regs.forEach((reg) => {
          reg.unregister().then((ok) => console.log('Unregistered service worker:', reg, ok));
        });
      })
      .catch((err) => console.warn('Error while getting service worker registrations:', err));
  }

  if (typeof caches !== 'undefined' && caches.keys) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => console.log('Cleared caches'))
      .catch((err) => console.warn('Failed to clear caches:', err));
  }
}