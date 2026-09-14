/**
 * Service Worker Registration & Status Listener (Phase C0)
 * Handles PWA offline shell registration and updates.
 */

export interface SwStatus {
  registered: boolean;
  controlling: boolean;
  offlineReady: boolean;
  error?: string;
}

type SwStatusCallback = (status: SwStatus) => void;

let currentStatus: SwStatus = {
  registered: false,
  controlling: false,
  offlineReady: false,
};

const listeners: SwStatusCallback[] = [];

export function subscribeSwStatus(callback: SwStatusCallback): () => void {
  listeners.push(callback);
  callback({ ...currentStatus });
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    listener({ ...currentStatus });
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    currentStatus = {
      registered: false,
      controlling: false,
      offlineReady: false,
      error: 'Service Worker未対応ブラウザ',
    };
    notifyListeners();
    return;
  }

  // Update controlling status if already controlled
  if (navigator.serviceWorker.controller) {
    currentStatus.controlling = true;
    currentStatus.offlineReady = true;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    currentStatus.controlling = true;
    currentStatus.offlineReady = true;
    notifyListeners();
  });

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    currentStatus.registered = true;

    if (registration.active) {
      currentStatus.offlineReady = true;
    }

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              currentStatus.offlineReady = true;
            } else {
              // First install offline ready
              currentStatus.offlineReady = true;
            }
            notifyListeners();
          }
        });
      }
    });

    notifyListeners();
  } catch (err) {
    currentStatus.error = err instanceof Error ? err.message : String(err);
    notifyListeners();
  }
}
