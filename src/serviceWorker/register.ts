export class ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private swController: ServiceWorker | null = null;

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', this.swRegistration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      this.swController = this.swRegistration.active;

      // Listen for service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async sendMessage(message: any): Promise<void> {
    if (!this.swController) {
      console.warn('Service Worker not ready');
      return;
    }

    try {
      await this.swController.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to Service Worker:', error);
    }
  }

  async cacheImage(url: string): Promise<void> {
    await this.sendMessage({
      type: 'CACHE_IMAGE',
      url
    });
  }

  async preloadImages(urls: string[]): Promise<void> {
    await this.sendMessage({
      type: 'PRELOAD_IMAGES',
      urls
    });
  }

  async cleanupCache(currentIndex: number, totalImages: number): Promise<void> {
    await this.sendMessage({
      type: 'CLEANUP_CACHE',
      currentIndex,
      totalImages
    });
  }

  isReady(): boolean {
    return this.swController !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }
}