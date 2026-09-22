export type SwMessage =
  | { type: 'CACHE_IMAGE'; url: string }
  | { type: 'PRELOAD_IMAGES'; urls: string[] }
  | { type: 'CLEANUP_CACHE'; keepUrls: string[] };

export class ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  private controller(): ServiceWorker | null {
    return navigator.serviceWorker.controller ?? this.swRegistration?.active ?? null;
  }

  async sendMessage(message: SwMessage): Promise<void> {
    const target = this.controller();
    if (!target) {
      console.warn('Service Worker not ready, skipping message:', message.type);
      return;
    }
    try {
      target.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to Service Worker:', error);
    }
  }

  async preloadImages(urls: string[]): Promise<void> {
    await this.sendMessage({ type: 'PRELOAD_IMAGES', urls });
  }

  async cleanupCache(keepUrls: string[]): Promise<void> {
    await this.sendMessage({ type: 'CLEANUP_CACHE', keepUrls });
  }

  isReady(): boolean {
    return this.controller() !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }
}
