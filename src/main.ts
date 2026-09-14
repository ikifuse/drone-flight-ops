/**
 * drone-flight-ops Application Entry Point (Phase C0)
 * Initializes CSS tokens, bootstraps the AppShell, and registers the PWA Service Worker.
 */

import './presentation/styles/tokens.css';
import './presentation/styles/shell.css';
import { AppShell } from './app/App';
import { registerServiceWorker } from './app/service-worker-reg';

function bootstrap(): void {
  const rootElement = document.getElementById('app');
  if (!rootElement) {
    console.error('Fatal: Target container #app not found in document.');
    return;
  }

  try {
    const app = new AppShell(rootElement);

    // Register PWA Service Worker after DOM is ready
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      registerServiceWorker().catch((err) => {
        console.warn('Service Worker registration warning:', err);
      });
    }

    // Global error listener for error boundary
    window.addEventListener('error', (event) => {
      app.showError(`実行時エラー: ${event.message}`);
    });

    window.addEventListener('unhandledrejection', (event) => {
      app.showError(`未処理のPromiseエラー: ${String(event.reason)}`);
    });
  } catch (err) {
    console.error('Fatal: Failed to initialize AppShell:', err);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #f87171; background-color: #0a0f1d; font-family: sans-serif;">
        <h2>初期化エラー</h2>
        <p>${err instanceof Error ? err.message : String(err)}</p>
      </div>
    `;
  }
}

// Bootstrap on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
