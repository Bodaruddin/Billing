import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(async (registration) => {
        await navigator.serviceWorker.ready;
        const urls = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((url) => {
            try {
              const parsed = new URL(url);
              return (
                parsed.origin === window.location.origin &&
                !parsed.pathname.startsWith('/api/')
              );
            } catch {
              return false;
            }
          });
        (registration.active ?? navigator.serviceWorker.controller)?.postMessage({
          type: 'CACHE_URLS',
          urls,
        });
      })
      .catch(() => {
        // The app remains usable in the current tab if browser installation is unavailable.
      });
  });
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
